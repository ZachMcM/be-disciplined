import { and, eq, gte, inArray, or, sql } from "drizzle-orm";
import { Router } from "express";
import * as z from "zod";
import { db } from "../db";
import { friend, post, user } from "../db/schema";
import { handleError } from "../utils/handleError";
import { invalidateQueriesForUser } from "../utils/invalidateQueries";
import { authMiddleware } from "../utils/middleware";

export const friendsRoute = Router();

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const SendRequestSchema = z.object({
  addresseeId: z.string().min(1),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getWeeklyPointsMap(userIds: string[]): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      userId: post.userId,
      totalPoints: sql<number>`COALESCE(SUM(${post.points}), 0)::int`,
    })
    .from(post)
    .where(and(inArray(post.userId, userIds), gte(post.createdAt, weekAgo)))
    .groupBy(post.userId);

  const map = new Map<string, number>();
  for (const row of rows) map.set(row.userId, row.totalPoints);
  return map;
}

async function getMutualFriendCount(
  myFriendIds: Set<string>,
  otherUserId: string,
): Promise<number> {
  if (myFriendIds.size === 0) return 0;
  const theirFriends = await db
    .select({
      friendId: sql<string>`CASE WHEN ${friend.requesterId} = ${otherUserId} THEN ${friend.addresseeId} ELSE ${friend.requesterId} END`,
    })
    .from(friend)
    .where(
      and(
        eq(friend.status, "accepted"),
        or(eq(friend.requesterId, otherUserId), eq(friend.addresseeId, otherUserId)),
      ),
    );
  return theirFriends.filter((f) => myFriendIds.has(f.friendId)).length;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/** GET /friends — current user's friends, incoming requests, and sent requests. */
friendsRoute.get("/friends", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId!;

    const [sentAccepted, receivedAccepted, requestsReceived, requestsSent] =
      await Promise.all([
        db
          .select({ friendship: friend, friendUser: user })
          .from(friend)
          .innerJoin(user, eq(user.id, friend.addresseeId))
          .where(and(eq(friend.requesterId, userId), eq(friend.status, "accepted"))),

        db
          .select({ friendship: friend, friendUser: user })
          .from(friend)
          .innerJoin(user, eq(user.id, friend.requesterId))
          .where(and(eq(friend.addresseeId, userId), eq(friend.status, "accepted"))),

        db
          .select({ friendship: friend, friendUser: user })
          .from(friend)
          .innerJoin(user, eq(user.id, friend.requesterId))
          .where(and(eq(friend.addresseeId, userId), eq(friend.status, "pending"))),

        db
          .select({ friendship: friend, friendUser: user })
          .from(friend)
          .innerJoin(user, eq(user.id, friend.addresseeId))
          .where(and(eq(friend.requesterId, userId), eq(friend.status, "pending"))),
      ]);

    const allFriendRows = [...sentAccepted, ...receivedAccepted];
    const friendIds = allFriendRows.map((f) => f.friendUser.id);
    const myFriendIds = new Set(friendIds);

    const weeklyPointsMap = await getWeeklyPointsMap([...friendIds, userId]);

    const sortedByPoints = [...friendIds, userId]
      .map((id) => ({ id, points: weeklyPointsMap.get(id) ?? 0 }))
      .sort((a, b) => b.points - a.points);

    const rankMap = new Map<string, number>();
    sortedByPoints.forEach((entry, i) => rankMap.set(entry.id, i + 1));

    const friends = allFriendRows
      .map((f) => ({
        ...f.friendship,
        friendUser: {
          id: f.friendUser.id,
          name: f.friendUser.name,
          image: f.friendUser.image,
        },
        weeklyPoints: weeklyPointsMap.get(f.friendUser.id) ?? 0,
        weeklyRank: rankMap.get(f.friendUser.id) ?? null,
        mutualFriendCount: 0,
      }))
      .sort((a, b) => (a.weeklyRank ?? 999) - (b.weeklyRank ?? 999));

    const requestsReceivedWithMutual = await Promise.all(
      requestsReceived.map(async (r) => ({
        ...r.friendship,
        friendUser: {
          id: r.friendUser.id,
          name: r.friendUser.name,
          image: r.friendUser.image,
        },
        weeklyPoints: 0,
        weeklyRank: null,
        mutualFriendCount: await getMutualFriendCount(myFriendIds, r.friendUser.id),
      })),
    );

    const requestsSentWithData = requestsSent.map((r) => ({
      ...r.friendship,
      friendUser: {
        id: r.friendUser.id,
        name: r.friendUser.name,
        image: r.friendUser.image,
      },
      weeklyPoints: 0,
      weeklyRank: null,
      mutualFriendCount: 0,
    }));

    res.json({ friends, requestsReceived: requestsReceivedWithMutual, requestsSent: requestsSentWithData });
  } catch (error) {
    handleError(error, res, "GET /friends");
  }
});

/** POST /friends/request — send a friend request. */
friendsRoute.post("/friends/request", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId!;
    const parsed = SendRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { addresseeId } = parsed.data;

    if (addresseeId === userId) {
      res.status(400).json({ error: "Cannot send a friend request to yourself" });
      return;
    }

    const [newFriendship] = await db
      .insert(friend)
      .values({ requesterId: userId, addresseeId, status: "pending" })
      .returning();

    const [friendUser] = await db
      .select({ id: user.id, name: user.name, image: user.image })
      .from(user)
      .where(eq(user.id, addresseeId))
      .limit(1);

    const result = { ...newFriendship, friendUser, weeklyPoints: 0, weeklyRank: null, mutualFriendCount: 0 };

    // Notify the addressee that they have a new request
    invalidateQueriesForUser(addresseeId, ["friends"]);

    res.status(201).json(result);
  } catch (error) {
    handleError(error, res, "POST /friends/request");
  }
});

/** PATCH /friends/:id/accept — accept an incoming friend request. */
friendsRoute.patch("/friends/:id/accept", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId!;
    const friendId = parseInt(req.params.id, 10);

    const [existing] = await db
      .select()
      .from(friend)
      .where(and(eq(friend.id, friendId), eq(friend.addresseeId, userId), eq(friend.status, "pending")))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Friend request not found" });
      return;
    }

    const [updated] = await db
      .update(friend)
      .set({ status: "accepted" })
      .where(eq(friend.id, friendId))
      .returning();

    const [friendUser] = await db
      .select({ id: user.id, name: user.name, image: user.image })
      .from(user)
      .where(eq(user.id, existing.requesterId))
      .limit(1);

    const result = { ...updated, friendUser, weeklyPoints: 0, weeklyRank: null, mutualFriendCount: 0 };

    // Notify the original requester that their request was accepted
    invalidateQueriesForUser(existing.requesterId, ["friends"]);

    res.json(result);
  } catch (error) {
    handleError(error, res, "PATCH /friends/:id/accept");
  }
});

/** PATCH /friends/:id/decline — decline an incoming friend request. */
friendsRoute.patch("/friends/:id/decline", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId!;
    const friendId = parseInt(req.params.id, 10);

    const [existing] = await db
      .select()
      .from(friend)
      .where(and(eq(friend.id, friendId), eq(friend.addresseeId, userId), eq(friend.status, "pending")))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Friend request not found" });
      return;
    }

    await db.delete(friend).where(eq(friend.id, friendId));

    // Notify the requester their request was declined
    invalidateQueriesForUser(existing.requesterId, ["friends"]);

    res.json({ success: true });
  } catch (error) {
    handleError(error, res, "PATCH /friends/:id/decline");
  }
});

/** DELETE /friends/:id — cancel a sent request or remove an accepted friend. */
friendsRoute.delete("/friends/:id", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId!;
    const friendId = parseInt(req.params.id, 10);

    const [existing] = await db
      .select()
      .from(friend)
      .where(
        and(
          eq(friend.id, friendId),
          or(eq(friend.requesterId, userId), eq(friend.addresseeId, userId)),
        ),
      )
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Friend relationship not found" });
      return;
    }

    await db.delete(friend).where(eq(friend.id, friendId));

    const otherUserId =
      existing.requesterId === userId ? existing.addresseeId : existing.requesterId;

    // Notify the other party
    invalidateQueriesForUser(otherUserId, ["friends"]);

    res.json({ success: true });
  } catch (error) {
    handleError(error, res, "DELETE /friends/:id");
  }
});
