import type { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE, verifySessionToken } from "../lib/session.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies[SESSION_COOKIE];
  const userId =
    typeof token === "string" ? await verifySessionToken(token) : null;

  if (userId === null) {
    res.status(401).json({ error: "No has iniciado sesión" });
    return;
  }

  req.userId = userId;
  next();
}
