import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_CALLBACK_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  FRONTEND_URL: z.url(),
});

export const env = envSchema.parse(process.env);
