import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDashboardWorkspaceId } from "@/lib/queries/dashboard/workspace";
import { getWorkspaceTeamData } from "@/lib/queries/workspace";
import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Team Members",
  description: "Manage your team members and invites",
};

async function Page({ params }: { params: Promise<{ workspace: string }> }) {
  const { workspace: workspaceSlug } = await params;
  const workspaceId = await getDashboardWorkspaceId(workspaceSlug);
  if (!workspaceId) {
    notFound();
  }

  const initialTeam = await getWorkspaceTeamData(workspaceId);
  if (!initialTeam) {
    notFound();
  }

  return (
    <PageClient initialTeam={initialTeam} workspaceSlug={workspaceSlug} />
  );
}

export default Page;
