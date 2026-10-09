import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const competitionsRouter = Router();

competitionsRouter.get("/", async (_req, res) => {
  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(competitions);
});
