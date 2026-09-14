import { notFound } from "next/navigation";
import { getPublishingMetrics } from "@/lib/queries/dashboard/publishing";
import { getDashboardUsageMetrics } from "@/lib/queries/dashboard/usage";
import { getDashboardWorkspaceId } from "@/lib/queries/dashboard/workspace";
import PageClient from "./page-client";

export const metadata = {
  title: "Home",
  description: "Workspace overview and metrics",
};

async function Page({ params }: { params: Promise<{ workspace: string }> }) {
  const { workspace } = await params;
  const workspaceId = await getDashboardWorkspaceId(workspace);
  if (!workspaceId) {
    notFound();
  }

  const [usage, publishing] = await Promise.all([
    getDashboardUsageMetrics(workspaceId),
    getPublishingMetrics(workspaceId),
  ]);

  return (
    <PageClient initialPublishing={publishing} initialUsage={usage} />
  );
}

export default Page;
