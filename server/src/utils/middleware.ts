import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { auth } from "./auth";

/**
 * Protects a route: validates the Better Auth session and exposes the user id
 * on `res.locals.userId` (typed in `express.d.ts`).
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.locals.userId = session.user.id;
    next();
  } catch (error) {
    console.error("Failed to get session:", error);
    res.status(503).json({ error: "Service temporarily unavailable" });
  }
};

/** Multipart upload middleware (in-memory, 5MB limit) for R2 uploads. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
