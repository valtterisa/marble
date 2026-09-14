"use client";

import { EditorDataProvider } from "@/components/editor/editor-data-provider";
import EditorPage from "@/components/editor/editor-page";
import type { EditorBootstrap } from "@/lib/queries/dashboard/editor";

function PageClient({
  postId,
  initialBootstrap,
}: {
  postId: string;
  initialBootstrap: EditorBootstrap;
}) {
  return (
    <EditorDataProvider initialBootstrap={initialBootstrap} postId={postId}>
      <EditorPage />
    </EditorDataProvider>
  );
}

export default PageClient;
