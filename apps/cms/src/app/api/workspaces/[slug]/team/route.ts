import { NextResponse } from "next/server";
import { requireWorkspaceAccess } from "@/lib/auth/access";
import { getWorkspaceTeamData } from "@/lib/queries/workspace";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const accessData = await requireWorkspaceAccess(slug);

  if (!accessData.ok) {
    return accessData.response;
  }

  const team = await getWorkspaceTeamData(accessData.workspaceId);

  if (!team) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  return NextResponse.json(team);
}
