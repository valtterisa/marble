import { NextResponse } from "next/server";
import { requireActiveWorkspaceAccess } from "@/lib/auth/access";
import { getPublishingMetrics } from "@/lib/queries/dashboard/publishing";

export async function GET() {
  const accessData = await requireActiveWorkspaceAccess();

  if (!accessData.ok) {
    return accessData.response;
  }

  const metrics = await getPublishingMetrics(accessData.workspaceId);
  return NextResponse.json(metrics);
}
