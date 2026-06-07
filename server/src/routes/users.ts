import { eq } from "drizzle-orm";
import { Router } from "express";
import * as z from "zod";
import { db } from "../db";
import { user } from "../db/schema";
import { handleError } from "../utils/handleError";
import { authMiddleware } from "../utils/middleware";

export const usersRoute = Router();

/** Current authenticated user. */
usersRoute.get("/users/me", authMiddleware, async (_req, res) => {
  try {
    const me = await db.query.user.findFirst({
      where: eq(user.id, res.locals.userId!),
    });

    if (!me) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(me);
  } catch (error) {
    handleError(error, res, "GET /users/me");
  }
});

const ExpoPushTokenSchema = z.object({
  expoPushToken: z.string().min(1),
});

/** Register the client's Expo push token. */
usersRoute.patch(
  "/users/expo-push-token",
  authMiddleware,
  async (req, res) => {
    try {
      const parsed = ExpoPushTokenSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
      }

      await db
        .update(user)
        .set({ expoPushToken: parsed.data.expoPushToken })
        .where(eq(user.id, res.locals.userId!));

      res.json({ success: true });
    } catch (error) {
      handleError(error, res, "PATCH /users/expo-push-token");
    }
  },
);
