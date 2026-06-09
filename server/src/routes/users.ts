import { eq } from "drizzle-orm";
import { Router } from "express";
import * as z from "zod";
import { db } from "../db";
import { user } from "../db/schema";
import { handleError } from "../utils/handleError";
import { authMiddleware } from "../utils/middleware";

export const usersRoute = Router();

const NameSchema = z.object({
  name: z.string().min(1),
});

usersRoute.patch("/users/name", authMiddleware, async (req, res) => {
  try {
    const parsed = NameSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    await db
      .update(user)
      .set({ name: parsed.data.name, onboardingStep: "complete" })
      .where(eq(user.id, res.locals.userId!));

    res.json({ success: true });
  } catch (error) {
    handleError(error, res, "PATCH /users/name");
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
