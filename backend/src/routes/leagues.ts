import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { calculatePoints } from "../scoring/calculatePoints.js";

export const leaguesRouter = Router();

leaguesRouter.get("/:id/standings", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "El id debe ser un número" });
    return;
  }

  const league = await prisma.league.findUnique({
    where: { id },
    include: {
      memberships: { include: { user: true } },
      predictions: {
        where: { match: { status: "FINISHED" } },
        include: { match: true },
      },
    },
  });

  if (!league) {
    res.status(404).json({ error: "Liga no encontrada" });
    return;
  }

  const pointsByUser = new Map<number, number>();

  for (const membership of league.memberships) {
    pointsByUser.set(membership.userId, 0);
  }

  for (const prediction of league.predictions) {
    const { homeGoals, awayGoals } = prediction.match;

    if (homeGoals === null || awayGoals === null) {
      continue;
    }

    const points = calculatePoints(
      { home: prediction.homeGoals, away: prediction.awayGoals },
      { home: homeGoals, away: awayGoals },
      { exactPoints: league.exactPoints, outcomePoints: league.outcomePoints },
    );

    const current = pointsByUser.get(prediction.userId) ?? 0;
    pointsByUser.set(prediction.userId, current + points);
  }

  const standings: { user: string; points: number }[] = [];

  for (const membership of league.memberships) {
    standings.push({
      user: membership.user.name,
      points: pointsByUser.get(membership.userId) ?? 0,
    });
  }

  standings.sort((a, b) => b.points - a.points);

  const ranking: { position: number; user: string; points: number }[] = [];

  for (const [index, entry] of standings.entries()) {
    const previous = ranking.at(-1);

    let position = index + 1;

    if (previous && previous.points === entry.points) {
      position = previous.position;
    }

    ranking.push({ position, ...entry });
  }

  res.json(ranking);
});
