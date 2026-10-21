export type StandingEntry = { user: string; points: number };
export type RankedEntry = StandingEntry & { position: number };

export function rankStandings(entries: StandingEntry[]): RankedEntry[] {
  const sorted = [...entries].sort((a, b) => b.points - a.points);
  const ranking: RankedEntry[] = [];

  for (const [index, entry] of sorted.entries()) {
    const previous = ranking.at(-1);

    let position = index + 1;

    if (previous && previous.points === entry.points) {
      position = previous.position;
    }

    ranking.push({ position, ...entry });
  }

  return ranking;
}
