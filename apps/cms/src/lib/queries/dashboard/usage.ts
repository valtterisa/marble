import "server-only";

import { db } from "@marble/db";
import { media, usageEvent } from "@marble/db/schema";
import { addDays, format, startOfDay, subDays, subHours } from "date-fns";
import { and, count, desc, eq, gte, isNotNull, lt, sql } from "drizzle-orm";
import type { UsageDashboardData } from "@/types/dashboard";

const CHART_DAYS = 30;

function buildChartSeries(
  chartStart: Date,
  rows: Array<{ day: string | Date; value: number }>
) {
  const chartBuckets = new Map<string, number>();
  for (let i = 0; i < CHART_DAYS; i += 1) {
    const date = addDays(chartStart, i);
    chartBuckets.set(format(date, "yyyy-MM-dd"), 0);
  }

  for (const row of rows) {
    const key =
      typeof row.day === "string"
        ? row.day.slice(0, 10)
        : format(startOfDay(row.day), "yyyy-MM-dd");
    chartBuckets.set(key, Number(row.value));
  }

  return Array.from(chartBuckets.entries()).map(([dateKey, chartCount]) => ({
    date: dateKey,
    label: format(new Date(`${dateKey}T00:00:00`), "MMM d"),
    value: chartCount,
  }));
}

export async function getDashboardUsageMetrics(
  workspaceId: string
): Promise<UsageDashboardData> {
  const now = new Date();
  const today = startOfDay(now);
  const chartStart = subDays(today, CHART_DAYS - 1);
  const previousPeriodStart = subDays(chartStart, CHART_DAYS);
  const dayExpression = sql<string>`to_char(date_trunc('day', ${usageEvent.createdAt}), 'YYYY-MM-DD')`;

  const [
    apiDailyRows,
    apiPrevPeriodCountResult,
    apiTotalCountResult,
    webhookTotalResult,
    webhookWeekResult,
    webhookDayResult,
    webhookTopEndpoint,
    webhookDailyRows,
    mediaTotalsResult,
    mediaLast30Result,
    mediaLastUpload,
    recentMediaUploads,
  ] = await Promise.all([
    db
      .select({
        day: dayExpression,
        value: count(),
      })
      .from(usageEvent)
      .where(
        and(
          eq(usageEvent.workspaceId, workspaceId),
          eq(usageEvent.type, "api_request"),
          gte(usageEvent.createdAt, chartStart)
        )
      )
      .groupBy(dayExpression),
    db
      .select({ count: count() })
      .from(usageEvent)
      .where(
        and(
          eq(usageEvent.workspaceId, workspaceId),
          eq(usageEvent.type, "api_request"),
          gte(usageEvent.createdAt, previousPeriodStart),
          lt(usageEvent.createdAt, chartStart)
        )
      ),
    db
      .select({ count: count() })
      .from(usageEvent)
      .where(
        and(
          eq(usageEvent.workspaceId, workspaceId),
          eq(usageEvent.type, "api_request")
        )
      ),
    db
      .select({ count: count() })
      .from(usageEvent)
      .where(
        and(
          eq(usageEvent.workspaceId, workspaceId),
          eq(usageEvent.type, "webhook_delivery")
        )
      ),
    db
      .select({ count: count() })
      .from(usageEvent)
      .where(
        and(
          eq(usageEvent.workspaceId, workspaceId),
          eq(usageEvent.type, "webhook_delivery"),
          gte(usageEvent.createdAt, subDays(now, 6))
        )
      ),
    db
      .select({ count: count() })
      .from(usageEvent)
      .where(
        and(
          eq(usageEvent.workspaceId, workspaceId),
          eq(usageEvent.type, "webhook_delivery"),
          gte(usageEvent.createdAt, subHours(now, 24))
        )
      ),
    db
      .select({
        endpoint: usageEvent.endpoint,
        count: count(),
      })
      .from(usageEvent)
      .where(
        and(
          eq(usageEvent.workspaceId, workspaceId),
          eq(usageEvent.type, "webhook_delivery"),
          isNotNull(usageEvent.endpoint)
        )
      )
      .groupBy(usageEvent.endpoint)
      .orderBy(desc(count()))
      .limit(1),
    db
      .select({
        day: dayExpression,
        value: count(),
      })
      .from(usageEvent)
      .where(
        and(
          eq(usageEvent.workspaceId, workspaceId),
          eq(usageEvent.type, "webhook_delivery"),
          gte(usageEvent.createdAt, chartStart)
        )
      )
      .groupBy(dayExpression),
    db
      .select({ count: count() })
      .from(usageEvent)
      .where(
        and(
          eq(usageEvent.workspaceId, workspaceId),
          eq(usageEvent.type, "media_upload")
        )
      ),
    db
      .select({ count: count() })
      .from(usageEvent)
      .where(
        and(
          eq(usageEvent.workspaceId, workspaceId),
          eq(usageEvent.type, "media_upload"),
          gte(usageEvent.createdAt, subDays(now, 29))
        )
      ),
    db.query.usageEvent.findFirst({
      where: and(
        eq(usageEvent.workspaceId, workspaceId),
        eq(usageEvent.type, "media_upload")
      ),
      orderBy: desc(usageEvent.createdAt),
      columns: { createdAt: true },
    }),
    db
      .select({
        id: media.id,
        name: media.name,
        size: media.size,
        alt: media.alt,
        createdAt: media.createdAt,
        type: media.type,
        url: media.url,
        mimeType: media.mimeType,
        width: media.width,
        height: media.height,
        duration: media.duration,
        blurHash: media.blurHash,
      })
      .from(media)
      .where(eq(media.workspaceId, workspaceId))
      .orderBy(desc(media.createdAt))
      .limit(10),
  ]);

  const apiPrevPeriodCount = apiPrevPeriodCountResult[0]?.count ?? 0;
  const apiTotalCount = apiTotalCountResult[0]?.count ?? 0;
  const webhookTotal = webhookTotalResult[0]?.count ?? 0;
  const webhookWeek = webhookWeekResult[0]?.count ?? 0;
  const webhookDay = webhookDayResult[0]?.count ?? 0;
  const mediaTotals = mediaTotalsResult[0]?.count ?? 0;
  const mediaLast30 = mediaLast30Result[0]?.count ?? 0;

  const apiChart = buildChartSeries(chartStart, apiDailyRows);
  const webhookChart = buildChartSeries(chartStart, webhookDailyRows);

  const apiLastPeriodCount = apiChart.reduce(
    (acc, curr) => acc + curr.value,
    0
  );
  const apiChange =
    apiPrevPeriodCount === 0
      ? apiLastPeriodCount > 0
        ? 100
        : 0
      : ((apiLastPeriodCount - apiPrevPeriodCount) / apiPrevPeriodCount) * 100;

  return {
    api: {
      totals: {
        total: apiTotalCount,
        lastPeriod: apiLastPeriodCount,
        changePercentage: Math.round(apiChange * 100) / 100,
      },
      chart: apiChart,
    },
    webhooks: {
      total: webhookTotal,
      last7Days: webhookWeek,
      last24Hours: webhookDay,
      topEndpoint: webhookTopEndpoint[0]?.endpoint ?? null,
      topEndpointCount: webhookTopEndpoint[0]?.count ?? 0,
      chart: webhookChart,
    },
    media: {
      total: mediaTotals,
      last30Days: mediaLast30,
      recentUploadsSize: recentMediaUploads.reduce(
        (sum, item) => sum + item.size,
        0
      ),
      lastUploadAt: mediaLastUpload?.createdAt.toISOString() ?? null,
      recentUploads: recentMediaUploads.map((item) => ({
        id: item.id,
        name: item.name,
        size: item.size,
        alt: item.alt,
        createdAt: item.createdAt.toISOString(),
        type: item.type,
        url: item.url,
        mimeType: item.mimeType,
        width: item.width,
        height: item.height,
        duration: item.duration,
        blurHash: item.blurHash,
      })),
    },
  };
}
