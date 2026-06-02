import type { CaptureConfig, CapturePlayerStats, GitAuthorStats } from "./types";

export const SCORE_WEIGHTS = {
  commit: 10,
  addition: 0.2,
  deletion: 0.1,
} as const;

export function calculateScore(commits: number, additions: number, deletions: number): number {
  return Number(
    (
      commits * SCORE_WEIGHTS.commit
      + additions * SCORE_WEIGHTS.addition
      + deletions * SCORE_WEIGHTS.deletion
    ).toFixed(2)
  );
}

export function calculatePercents(leftScore: number, rightScore: number): [number, number] {
  const total = leftScore + rightScore;
  if (total <= 0) {
    return [50, 50];
  }

  const leftPercent = Math.round((leftScore / total) * 100);
  return [leftPercent, 100 - leftPercent];
}

export function buildPlayerStats(
  config: CaptureConfig,
  authorStats: GitAuthorStats[]
): [CapturePlayerStats, CapturePlayerStats] {
  const statsByAuthor = new Map<string, GitAuthorStats>();
  authorStats.forEach(stat => {
    statsByAuthor.set(stat.name.toLowerCase(), stat);
    statsByAuthor.set(stat.email.toLowerCase(), stat);
  });

  const players = config.players.map(player => {
    const totals = player.authors.reduce(
      (acc, author) => {
        const stat = statsByAuthor.get(author.toLowerCase());
        if (!stat) return acc;

        return {
          commits: acc.commits + stat.commits,
          additions: acc.additions + stat.additions,
          deletions: acc.deletions + stat.deletions,
        };
      },
      { commits: 0, additions: 0, deletions: 0 }
    );

    return {
      side: player.side,
      label: player.label,
      githubUrl: player.githubUrl,
      score: calculateScore(totals.commits, totals.additions, totals.deletions),
      percent: 50,
      commits: totals.commits,
      additions: totals.additions,
      deletions: totals.deletions,
    };
  }) as [CapturePlayerStats, CapturePlayerStats];

  const [leftPercent, rightPercent] = calculatePercents(players[0].score, players[1].score);
  players[0].percent = leftPercent;
  players[1].percent = rightPercent;
  return players;
}
