import { describe, it, expect } from "vitest";
import { isPredictionOpen } from "./isPredictionOpen.js";

const locksAt = new Date("2026-10-09T21:00:00+02:00");

describe("isPredictionOpen", () => {
  it("está abierto un día antes del plazo", () => {
    const now = new Date(locksAt.getTime() - 24 * 60 * 60 * 1000);

    expect(isPredictionOpen(locksAt, now)).toBe(true);
  });

  it("está abierto un minuto antes del plazo", () => {
    const now = new Date(locksAt.getTime() - 60_000);

    expect(isPredictionOpen(locksAt, now)).toBe(true);
  });

  it("está cerrado justo a la hora del plazo", () => {
    const now = new Date(locksAt.getTime());

    expect(isPredictionOpen(locksAt, now)).toBe(false);
  });

  it("está cerrado un minuto después del plazo", () => {
    const now = new Date(locksAt.getTime() + 60_000);

    expect(isPredictionOpen(locksAt, now)).toBe(false);
  });
});
