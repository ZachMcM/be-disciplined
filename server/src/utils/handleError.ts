import { Response } from "express";
import { logger } from "./logger";

/** Centralized route error handler: logs (incl. Postgres details) and returns 500. */
export function handleError(
  error: unknown,
  res: Response,
  routeName: string = "Route",
): void {
  const pgError = error as {
    code?: string;
    detail?: string;
    constraint?: string;
  };

  logger.error(
    `${routeName} error:`,
    error instanceof Error ? error.message : String(error),
    pgError.code ? `PG code: ${pgError.code}` : "",
    pgError.detail ? `Detail: ${pgError.detail}` : "",
    pgError.constraint ? `Constraint: ${pgError.constraint}` : "",
    error instanceof Error ? error.stack : "",
  );

  res.status(500).json({
    error: error instanceof Error ? error.message : String(error),
  });
}
