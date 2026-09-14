"use client";

import { EditorDataProvider } from "@/components/editor/editor-data-provider";
import EditorPage from "@/components/editor/editor-page";
import type { EditorBootstrap } from "@/lib/queries/dashboard/editor";

function NewPostPageClient({
  initialBootstrap,
}: {
  initialBootstrap: EditorBootstrap;
}) {
  return (
    <EditorDataProvider initialBootstrap={initialBootstrap}>
      <EditorPage />
    </EditorDataProvider>
  );
}

export default NewPostPageClient;
