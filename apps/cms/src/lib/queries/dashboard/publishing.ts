import "server-only";

import { db } from "@marble/db";
import { post } from "@marble/db/schema";
import { eachDayOfInterval, endOfYear, format, startOfYear } from "date-fns";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import type { PublishingMetricsData } from "@/types/dashboard";

export async function getPublishingMetrics(
  workspaceId: string
): Promise<PublishingMetricsData> {
  const now = new Date();
  const startOfCurrentYear = startOfYear(now);
  const endOfCurrentYear = endOfYear(now);
  const dayExpression = sql<string>`to_char(date_trunc('day', ${post.publishedAt}), 'YYYY-MM-DD')`;

  const dailyRows = await db
    .select({
      day: dayExpression,
      count: sql<number>`count(*)::int`,
    })
    .from(post)
    .where(
      and(
        eq(post.workspaceId, workspaceId),
        eq(post.status, "published"),
        gte(post.publishedAt, startOfCurrentYear),
        lte(post.publishedAt, endOfCurrentYear)
      )
    )
    .groupBy(dayExpression);

  const dateCountMap = new Map<string, number>();
  for (const row of dailyRows) {
    const key =
      typeof row.day === "string"
        ? row.day.slice(0, 10)
        : format(row.day, "yyyy-MM-dd");
    dateCountMap.set(key, Number(row.count));
  }

  const allDaysInYear = eachDayOfInterval({
    start: startOfCurrentYear,
    end: endOfCurrentYear,
  });

  const maxCount = Math.max(...Array.from(dateCountMap.values()), 1);

  const activityData = allDaysInYear.map((date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const count = dateCountMap.get(dateKey) || 0;

    let level: number;
    const percentage = count === 0 ? 0 : (count / maxCount) * 100;

    if (count === 0) {
      level = 0;
    } else if (percentage <= 25) {
      level = 1;
    } else if (percentage <= 50) {
      level = 2;
    } else if (percentage <= 75) {
      level = 3;
    } else {
      level = 4;
    }

    return {
      date: dateKey,
      count,
      level,
    };
  });

  return {
    graph: {
      activity: activityData,
    },
  };
}
