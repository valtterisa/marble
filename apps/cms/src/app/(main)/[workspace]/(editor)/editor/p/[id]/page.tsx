import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEditorBootstrap } from "@/lib/queries/dashboard/editor";
import { getDashboardWorkspaceId } from "@/lib/queries/dashboard/workspace";
import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Update Post - Marble",
};

async function Page({
  params,
}: {
  params: Promise<{ workspace: string; id: string }>;
}) {
  const { workspace, id } = await params;
  const workspaceId = await getDashboardWorkspaceId(workspace);
  if (!workspaceId) {
    notFound();
  }

  const initialBootstrap = await getEditorBootstrap(workspaceId, id);
  if (!initialBootstrap) {
    notFound();
  }

  return <PageClient initialBootstrap={initialBootstrap} postId={id} />;
}

export default Page;
