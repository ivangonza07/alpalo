import "dotenv/config";
import express from "express";
import { competitionsRouter } from "./routes/competitions.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/competitions", competitionsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/ping", (_req, res) => {
  res.json({ message: "pong" });
});

app.post("/eco", (req, res) => {
  res.json({ recibido: req.body });
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
