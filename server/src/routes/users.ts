import { and, eq, ilike, ne } from "drizzle-orm";
import { Router } from "express";
import * as z from "zod";
import { db } from "../db";
import { user } from "../db/schema";
import { handleError } from "../utils/handleError";
import { authMiddleware, upload } from "../utils/middleware";
import { invalidateQueries } from "../utils/invalidateQueries";
import { uploadToR2 } from "../utils/r2";

export const usersRoute = Router();

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
] as const;

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
      .set({ name: parsed.data.name, onboardingStep: "image" })
      .where(eq(user.id, res.locals.userId!));

    res.json({ success: true });

    invalidateQueries(["user", res.locals.userId!]);
  } catch (error) {
    handleError(error, res, "PATCH /users/name");
  }
});

/** Upload a profile image to R2 and return its public URL. */
usersRoute.post(
  "/users/image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      if (
        !ALLOWED_IMAGE_MIME_TYPES.includes(
          file.mimetype as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
        )
      ) {
        res.status(400).json({ error: "File must be an image" });
        return;
      }

      const ext = file.originalname.split(".").pop() ?? "jpg";
      const key = `avatars/${res.locals.userId}/${crypto.randomUUID()}.${ext}`;
      const url = await uploadToR2({
        key,
        body: file.buffer,
        contentType: file.mimetype,
      });

      res.status(201).json({ url });
    } catch (error) {
      handleError(error, res, "POST /users/image");
    }
  },
);

const ImageSchema = z.object({
  image: z.string().url(),
});

usersRoute.patch("/users/image", authMiddleware, async (req, res) => {
  try {
    const parsed = ImageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    await db
      .update(user)
      .set({ image: parsed.data.image, onboardingStep: "complete" })
      .where(eq(user.id, res.locals.userId!));

    res.json({ success: true });

    invalidateQueries(["user", res.locals.userId!]);
  } catch (error) {
    handleError(error, res, "PATCH /users/image");
  }
});

const ExpoPushTokenSchema = z.object({
  expoPushToken: z.string().min(1),
});

usersRoute.patch("/users/expo-push-token", authMiddleware, async (req, res) => {
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
});

usersRoute.get("/users/search", authMiddleware, async (req, res) => {
  try {
    const query =
      typeof req.query.query === "string" ? req.query.query.trim() : "";
    if (!query) {
      res.json([]);
      return;
    }

    const results = await db
      .select({ id: user.id, name: user.name, image: user.image })
      .from(user)
      .where(
        and(ilike(user.name, `%${query}%`), ne(user.id, res.locals.userId!)),
      )
      .limit(20);

    res.json(results);
  } catch (error) {
    handleError(error, res, "GET /users/search");
  }
});
