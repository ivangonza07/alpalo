export type Score = { home: number; away: number };
export type ScoringRules = { exactPoints: number; outcomePoints: number };

export function calculatePoints(
  prediction: Score,
  result: Score,
  rules: ScoringRules,
): number {
  //Pronóstico 3-1 → predictedSign = Math.sign(3 - 1) = Math.sign(2) = 1   (gana el local)
  //Resultado  1-1 → resultSign    = Math.sign(1 - 1) = Math.sign(0) = 0   (empate)

  const predictedSign = Math.sign(prediction.home - prediction.away);
  const resultSign = Math.sign(result.home - result.away);

  if (prediction.home === result.home && prediction.away === result.away) {
    return rules.exactPoints;
  }
  if (predictedSign === resultSign) {
    return rules.outcomePoints;
  }

  return 0;
}
