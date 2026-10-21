import "dotenv/config";
import express from "express";
import { competitionsRouter } from "./routes/competitions.js";
import { leaguesRouter } from "./routes/leagues.js";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/competitions", competitionsRouter);
app.use("/leagues", leaguesRouter);

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
