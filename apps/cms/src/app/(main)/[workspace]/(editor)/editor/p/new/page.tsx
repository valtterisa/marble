import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEditorBootstrap } from "@/lib/queries/dashboard/editor";
import { getDashboardWorkspaceId } from "@/lib/queries/dashboard/workspace";
import NewPostPageClient from "./page-client";

export const metadata: Metadata = {
  title: "New Post - Marble",
};

export default async function Page({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;
  const workspaceId = await getDashboardWorkspaceId(workspace);
  if (!workspaceId) {
    notFound();
  }

  const initialBootstrap = await getEditorBootstrap(workspaceId);
  if (!initialBootstrap) {
    notFound();
  }

  return <NewPostPageClient initialBootstrap={initialBootstrap} />;
}
