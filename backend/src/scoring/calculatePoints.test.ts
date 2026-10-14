import { describe, it, expect } from "vitest";
import { calculatePoints } from "./calculatePoints.js";

const rules = { exactPoints: 3, outcomePoints: 1 };

describe("calculatePoints", () => {
  it("da los puntos de resultado exacto", () => {
    const points = calculatePoints(
      { home: 2, away: 1 },
      { home: 2, away: 1 },
      rules,
    );
    expect(points).toBe(3);
  });

  it("da los puntos de signo si acierta el ganador pero no el marcador", () => {
    const points = calculatePoints(
      { home: 3, away: 0 },
      { home: 1, away: 0 },
      rules,
    );
    expect(points).toBe(1);
  });

  it("da los puntos de signo si acierta el ganador visitante pero no el marcador", () => {
    const points = calculatePoints(
      { home: 0, away: 2 },
      { home: 1, away: 3 },
      rules,
    );
    expect(points).toBe(1);
  });

  it("da los puntos de signo si acierta el empate pero no el marcador", () => {
    const points = calculatePoints(
      { home: 1, away: 1 },
      { home: 0, away: 0 },
      rules,
    );
    expect(points).toBe(1);
  });

  it("da los puntos de resultado exacto en un empate exacto", () => {
    const points = calculatePoints(
      { home: 0, away: 0 },
      { home: 0, away: 0 },
      rules,
    );
    expect(points).toBe(3);
  });

  it("no da puntos si falla el signo", () => {
    const points = calculatePoints(
      { home: 2, away: 1 },
      { home: 0, away: 1 },
      rules,
    );
    expect(points).toBe(0);
  });

  it("no da puntos si predice victoria y el resultado es empate", () => {
    const points = calculatePoints(
      { home: 3, away: 1 },
      { home: 1, away: 1 },
      rules,
    );
    expect(points).toBe(0);
  });

  it("usa las reglas de la liga y no valores fijos", () => {
    const customRules = { exactPoints: 5, outcomePoints: 2 };

    const exact = calculatePoints(
      { home: 2, away: 1 },
      { home: 2, away: 1 },
      customRules,
    );
    const outcome = calculatePoints(
      { home: 3, away: 0 },
      { home: 1, away: 0 },
      customRules,
    );

    expect(exact).toBe(5);
    expect(outcome).toBe(2);
  });
});
