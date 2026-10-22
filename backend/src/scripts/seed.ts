// script para borrar la BD y despues rellenar la BD con datos reales para hacer pruebas

import "dotenv/config";
import { prisma } from "../utils/prisma.js";

async function main() {
  // Borrar en orden inverso a las dependencias
  await prisma.prediction.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.league.deleteMany();
  await prisma.match.deleteMany();
  await prisma.matchday.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.user.deleteMany();

  const competition = await prisma.competition.create({
    data: { name: "LaLiga", season: "2026-27" },
  });

  const matchday = await prisma.matchday.create({
    data: {
      number: 5,
      locksAt: new Date("2026-10-09T21:00:00+02:00"),
      competitionId: competition.id,
    },
  });

  const match1 = await prisma.match.create({
    data: {
      homeTeam: "Real Madrid",
      awayTeam: "Sevilla",
      kickoffAt: new Date("2026-10-09T21:00:00+02:00"),
      homeGoals: 2,
      awayGoals: 1,
      status: "FINISHED",
      matchdayId: matchday.id,
    },
  });
  const match2 = await prisma.match.create({
    data: {
      homeTeam: "Barcelona",
      awayTeam: "Valencia",
      kickoffAt: new Date("2026-10-10T16:15:00+02:00"),
      homeGoals: 2,
      awayGoals: 0,
      status: "FINISHED",
      matchdayId: matchday.id,
    },
  });
  const match3 = await prisma.match.create({
    data: {
      homeTeam: "Athletic",
      awayTeam: "Real Sociedad",
      kickoffAt: new Date("2026-10-11T18:30:00+02:00"),
      homeGoals: 1,
      awayGoals: 0,
      status: "FINISHED",
      matchdayId: matchday.id,
    },
  });

  const ivan = await prisma.user.create({
    data: { name: "Iván", provider: "GITHUB", providerId: "seed-1" },
  });
  const mikel = await prisma.user.create({
    data: { name: "Mikel", provider: "GITHUB", providerId: "seed-2" },
  });
  const ane = await prisma.user.create({
    data: { name: "Ane", provider: "GITHUB", providerId: "seed-3" },
  });

  const league = await prisma.league.create({
    data: {
      name: "La cuadrilla",
      inviteCode: "PALO-7Q2K",
      exactPoints: 3,
      outcomePoints: 1,
      competitionId: competition.id,
    },
  });

  await prisma.membership.createMany({
    data: [
      { userId: ivan.id, leagueId: league.id, role: "ADMIN" },
      { userId: mikel.id, leagueId: league.id, role: "PLAYER" },
      { userId: ane.id, leagueId: league.id, role: "PLAYER" },
    ],
  });

  await prisma.prediction.createMany({
    data: [
      {
        userId: ivan.id,
        leagueId: league.id,
        matchId: match1.id,
        homeGoals: 2,
        awayGoals: 1,
      },
      {
        userId: ivan.id,
        leagueId: league.id,
        matchId: match2.id,
        homeGoals: 3,
        awayGoals: 0,
      },
      {
        userId: ivan.id,
        leagueId: league.id,
        matchId: match3.id,
        homeGoals: 1,
        awayGoals: 1,
      },
      {
        userId: mikel.id,
        leagueId: league.id,
        matchId: match1.id,
        homeGoals: 1,
        awayGoals: 0,
      },
      {
        userId: mikel.id,
        leagueId: league.id,
        matchId: match2.id,
        homeGoals: 2,
        awayGoals: 0,
      },
      {
        userId: mikel.id,
        leagueId: league.id,
        matchId: match3.id,
        homeGoals: 0,
        awayGoals: 1,
      },
      {
        userId: ane.id,
        leagueId: league.id,
        matchId: match1.id,
        homeGoals: 1,
        awayGoals: 1,
      },
      {
        userId: ane.id,
        leagueId: league.id,
        matchId: match2.id,
        homeGoals: 2,
        awayGoals: 1,
      },
    ],
  });

  console.log("Seed completado");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
