import type { Metadata } from "next";
import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Team Members",
  description: "Manage your team members and invites",
};

async function Page({ params }: { params: Promise<{ workspace: string }> }) {
  const { workspace: workspaceSlug } = await params;

  return <PageClient workspaceSlug={workspaceSlug} />;
}

export default Page;
