import { Router } from "express";
import { prisma } from "../utils/prisma.js";
import { calculatePoints } from "../scoring/calculatePoints.js";
import { rankStandings } from "../scoring/rankStandings.js";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { generateInviteCode } from "../utils/inviteCode.js";

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

  res.json(rankStandings(standings));
});

const createLeagueSchema = z.object({
  name: z.string().trim().min(1).max(50),
  competitionId: z.number().int().positive(),
});

leaguesRouter.post("/", requireAuth, async (req, res) => {
  const userId = req.userId;

  if (userId === undefined) {
    res.status(401).json({ error: "No has iniciado sesión" });
    return;
  }

  const result = createLeagueSchema.safeParse(req.body);

  if (!result.success) {
    res
      .status(400)
      .json({ error: "Datos no válidos", details: result.error.issues });
    return;
  }

  const competition = await prisma.competition.findUnique({
    where: { id: result.data.competitionId },
  });

  if (!competition) {
    res.status(404).json({ error: "Competición no encontrada" });
    return;
  }

  const league = await prisma.league.create({
    data: {
      name: result.data.name,
      inviteCode: generateInviteCode(),
      competitionId: competition.id,
      memberships: { create: { userId, role: "ADMIN" } },
    },
  });

  res.status(201).json({
    id: league.id,
    name: league.name,
    inviteCode: league.inviteCode,
    competitionId: league.competitionId,
  });
});

const joinLeagueSchema = z.object({
  inviteCode: z.string().trim().toUpperCase().min(1),
});

// el id de la liga viaja en el cuerpo de la peticion
leaguesRouter.post("/join", requireAuth, async (req, res) => {
  const userId = req.userId;

  if (userId === undefined) {
    res.status(401).json({ error: "No has iniciado sesión" });
    return;
  }

  const result = joinLeagueSchema.safeParse(req.body);

  if (!result.success) {
    res
      .status(400)
      .json({ error: "Datos no válidos", details: result.error.issues });
    return;
  }

  const league = await prisma.league.findUnique({
    where: { inviteCode: result.data.inviteCode },
  });

  if (!league) {
    res.status(404).json({ error: "La liga no existe" });
    return;
  }

  const userInLeague = await prisma.membership.findUnique({
    where: { userId_leagueId: { userId, leagueId: league.id } },
  });

  if (userInLeague) {
    res.status(409).json({ error: "User exist" });
    return;
  }

  await prisma.membership.create({
    data: { userId, leagueId: league.id, role: "PLAYER" },
  });

  res.status(201).json({
    id: league.id,
    name: league.name,
  });
});
