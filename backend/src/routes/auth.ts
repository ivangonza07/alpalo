import { Router } from "express";
import {
  GitHub,
  generateState,
  OAuth2RequestError,
  ArcticFetchError,
} from "arctic";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  SESSION_COOKIE,
  SESSION_DURATION_MS,
  createSessionToken,
} from "../lib/session.js";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

export const authRouter = Router();

const github = new GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
  env.GITHUB_CALLBACK_URL,
);

const STATE_COOKIE = "github_oauth_state";

const githubProfileSchema = z.object({
  id: z.number(),
  login: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  avatar_url: z.string(),
});

authRouter.get("/github", (_req, res) => {
  const state = generateState();
  const url = github.createAuthorizationURL(state, []);

  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
  });
  res.redirect(url.toString());
});

authRouter.get("/github/callback", async (req, res) => {
  const code = req.query["code"];
  const state = req.query["state"];
  const storedState = req.cookies[STATE_COOKIE];

  if (
    typeof code !== "string" ||
    typeof state !== "string" ||
    state !== storedState
  ) {
    res.status(400).json({ error: "Petición de login no válida" });
    return;
  }

  res.clearCookie(STATE_COOKIE);

  let accessToken: string;
  try {
    const tokens = await github.validateAuthorizationCode(code);
    accessToken = tokens.accessToken();
  } catch (error) {
    if (
      error instanceof OAuth2RequestError ||
      error instanceof ArcticFetchError
    ) {
      res
        .status(400)
        .json({ error: "No se pudo completar el login con GitHub" });
      return;
    }
    throw error;
  }

  const response = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const parsed = githubProfileSchema.safeParse(await response.json());

  if (!parsed.success) {
    res.status(502).json({ error: "Respuesta inesperada de GitHub" });
    return;
  }

  const profile = parsed.data;
  const providerId = String(profile.id);
  const name = profile.name ?? profile.login;

  const user = await prisma.user.upsert({
    where: { provider_providerId: { provider: "GITHUB", providerId } },
    update: { name, email: profile.email, avatarUrl: profile.avatar_url },
    create: {
      provider: "GITHUB",
      providerId,
      name,
      email: profile.email,
      avatarUrl: profile.avatar_url,
    },
  });

  const token = await createSessionToken(user.id);

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_DURATION_MS,
  });

  // Provisional: cuando exista el frontend, aquí irá res.redirect(env.FRONTEND_URL)
  res.json({ id: user.id, name: user.name });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const userId = req.userId;

  if (userId === undefined) {
    res.status(401).json({ error: "No has iniciado sesión" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    res.status(401).json({ error: "No has iniciado sesión" });
    return;
  }

  res.json({ id: user.id, name: user.name, avatarUrl: user.avatarUrl });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE);
  res.status(204).send();
});
