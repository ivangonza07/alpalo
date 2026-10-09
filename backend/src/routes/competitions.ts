import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";

export const competitionsRouter = Router();

// zod es un validador de los datos que llegan
const createCompetitionSchema = z.object({
  name: z.string().trim().min(1),
  season: z.string().trim().min(1),
});

competitionsRouter.post("/", async (req, res) => {
  const result = createCompetitionSchema.safeParse(req.body);

  if (!result.success) {
    res
      .status(400)
      .json({ error: "Datos no válidos", details: result.error.issues });
    return;
  }

  const competition = await prisma.competition.create({ data: result.data });
  res.status(201).json(competition);
});

competitionsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "El id debe ser un número" });
    return;
  }

  const competition = await prisma.competition.findUnique({ where: { id } });

  if (!competition) {
    res.status(404).json({ error: "Competición no encontrada" });
    return;
  }

  res.json(competition);
});
