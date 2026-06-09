import { Router } from "express";
import * as z from "zod";
import { db } from "../db";
import { post } from "../db/schema";
import { tagsList } from "../config.ts/tags";
import { handleError } from "../utils/handleError";
import { authMiddleware, upload } from "../utils/middleware";
import { uploadToR2 } from "../utils/r2";

export const postsRoute = Router();

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
] as const;

const TagSchema = z.object({
  tag: z.string(),
  category: z.enum(["Fitness", "Health", "Learning"]),
  scoringBucket: z.enum([
    "strength_training",
    "cardio",
    "sports",
    "nutrition",
    "study",
    "career",
  ]),
  basePoints: z.number(),
});

const CreatePostSchema = z.object({
  imageUrl: z.string().url(),
  caption: z.string(),
  tag: TagSchema,
});

/** Upload a post image to R2 and return its public URL. */
postsRoute.post(
  "/posts/image",
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
      const key = `posts/${res.locals.userId}/${crypto.randomUUID()}.${ext}`;
      const url = await uploadToR2({ key, body: file.buffer, contentType: file.mimetype });

      res.status(201).json({ url });
    } catch (error) {
      handleError(error, res, "POST /posts/image");
    }
  },
);

/** Create a new post. */
postsRoute.post("/posts", authMiddleware, async (req, res) => {
  try {
    const parsed = CreatePostSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { imageUrl, caption, tag } = parsed.data;

    const knownTag = tagsList.find((t) => t.tag === tag.tag);
    const points = knownTag?.basePoints ?? tag.basePoints;

    const newPost = await db
      .insert(post)
      .values({
        userId: res.locals.userId!,
        imageUrl,
        caption,
        tag,
        points,
      })
      .returning();

    res.status(201).json(newPost[0]);
  } catch (error) {
    handleError(error, res, "POST /posts");
  }
});