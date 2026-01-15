import { prisma } from "@/lib/prisma";

export async function recalculateWeeksScores(weekId: string) {
  const id = Number(weekId);
  const week = await prisma.week.findUnique({
    where: { id: id },
    include: {
      games: {
        include: {
          picks: true,
          sideBets: true,
        },
      },
    },
  });

  if (!week) return;

  const multiplier = week.multiplier;
  const scores: Record<number, number> = {};

  for (const game of week.games) {
    for (const pick of game.picks) {
      let points = 0;

      // Winner
      if (game.winningTeam && pick.pickedWinner) {
        points +=
          pick.pickedWinner === game.winningTeam
            ? 1 * multiplier
            : -1 * multiplier;
      }

      // TDs
      if (game.correctTDs != null && pick.pickedTDs != null) {
        if (pick.pickedTDs === game.correctTDs) {
          points += 1 * multiplier;
        }
      }

      scores[pick.userId] = (scores[pick.userId] ?? 0) + points;
    }

    // Side bets
    for (const sb of game.sideBets) {
      let sbPoints = 0;

      if (sb.result === "CORRECT") {
        sbPoints = Math.round((sb.odds * multiplier) - 1);
      } else if (sb.result === "INCORRECT") {
        sbPoints = -1 * multiplier;
      }

      scores[sb.userId] = (scores[sb.userId] ?? 0) + sbPoints;
    }
  }

  for (const [userIdStr, points] of Object.entries(scores)) {
    await prisma.score.upsert({
      where: {
        userId_weekId: {
          userId: Number(userIdStr),
          weekId: id,
        },
      },
      update: { points },
      create: {
        userId: Number(userIdStr),
        weekId: id,
        points,
      },
    });
  }
}
