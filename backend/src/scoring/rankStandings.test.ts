import { describe, it, expect } from "vitest";
import { rankStandings } from "./rankStandings.js";

describe("rankStandings", () => {
  it("devuelve una lista vacía si no hay nadie", () => {
    expect(rankStandings([])).toEqual([]);
  });

  it("asigna posición 1 si solo hay una persona", () => {
    const result = rankStandings([{ user: "Iván", points: 0 }]);

    expect(result).toEqual([{ position: 1, user: "Iván", points: 0 }]);
  });

  it("asigna posiciones consecutivas si no hay empates", () => {
    const result = rankStandings([
      { user: "Ane", points: 1 },
      { user: "Iván", points: 5 },
      { user: "Mikel", points: 3 },
    ]);

    expect(result).toEqual([
      { position: 1, user: "Iván", points: 5 },
      { position: 2, user: "Mikel", points: 3 },
      { position: 3, user: "Ane", points: 1 },
    ]);
  });

  it("comparte posición en un empate arriba y salta la siguiente", () => {
    const result = rankStandings([
      { user: "Iván", points: 4 },
      { user: "Mikel", points: 4 },
      { user: "Ane", points: 1 },
    ]);

    expect(result).toEqual([
      { position: 1, user: "Iván", points: 4 },
      { position: 1, user: "Mikel", points: 4 },
      { position: 3, user: "Ane", points: 1 },
    ]);
  });

  it("comparte posición en un empate triple en medio", () => {
    const result = rankStandings([
      { user: "Iván", points: 5 },
      { user: "Mikel", points: 3 },
      { user: "Ane", points: 3 },
      { user: "Jon", points: 3 },
      { user: "Leire", points: 0 },
    ]);

    expect(result.map((entry) => entry.position)).toEqual([1, 2, 2, 2, 5]);
  });

  it("comparte posición en un empate abajo", () => {
    const result = rankStandings([
      { user: "Iván", points: 5 },
      { user: "Mikel", points: 2 },
      { user: "Ane", points: 2 },
    ]);

    expect(result.map((entry) => entry.position)).toEqual([1, 2, 2]);
  });

  it("pone a todos en la posición 1 si todos empatan", () => {
    const result = rankStandings([
      { user: "Iván", points: 2 },
      { user: "Mikel", points: 2 },
      { user: "Ane", points: 2 },
    ]);

    expect(result.map((entry) => entry.position)).toEqual([1, 1, 1]);
  });

  it("pone a todos en la posición 1 si todos tienen 0 puntos", () => {
    const result = rankStandings([
      { user: "Iván", points: 0 },
      { user: "Mikel", points: 0 },
    ]);

    expect(result.map((entry) => entry.position)).toEqual([1, 1]);
  });

  it("no modifica la lista original", () => {
    const input = [
      { user: "Ane", points: 1 },
      { user: "Iván", points: 5 },
    ];
    const copy = structuredClone(input);

    rankStandings(input);

    expect(input).toEqual(copy);
  });
});
