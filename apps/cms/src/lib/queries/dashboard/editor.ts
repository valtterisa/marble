import "server-only";

import { db } from "@marble/db";
import {
  fieldValue,
  post as postTable,
  postToAuthor,
  postToTag,
} from "@marble/db/schema";
import { and, eq } from "drizzle-orm";
import { emptyPost } from "@/lib/data/post";
import { getDashboardCustomFields } from "@/lib/queries/dashboard/settings";
import type { PostEditorValues, PostValues } from "@/lib/validations/post";
import type { CustomField } from "@/types/fields";

export type EditorBootstrap = {
  fields: CustomField[];
  values: PostEditorValues;
};

function buildEditorValues(
  fields: CustomField[],
  post?: PostValues,
  customFieldValues?: Record<string, string>
): PostEditorValues {
  const values: PostValues = post
    ? {
        ...post,
        publishedAt: new Date(post.publishedAt),
      }
    : {
        ...emptyPost,
        authors: [],
      };

  return {
    ...values,
    customFields: Object.fromEntries(
      fields.map((fieldItem) => [
        fieldItem.id,
        customFieldValues?.[fieldItem.id] ?? "",
      ])
    ),
  };
}

export async function getEditorBootstrap(
  workspaceId: string,
  postId?: string
): Promise<EditorBootstrap | null> {
  if (!postId) {
    const fields = await getDashboardCustomFields(workspaceId);
    return {
      fields,
      values: buildEditorValues(fields),
    };
  }

  const postRow = await db.query.post.findFirst({
    where: and(
      eq(postTable.id, postId),
      eq(postTable.workspaceId, workspaceId)
    ),
    columns: {
      id: true,
      slug: true,
      title: true,
      status: true,
      featured: true,
      content: true,
      coverImage: true,
      description: true,
      publishedAt: true,
      contentJson: true,
      categoryId: true,
    },
  });

  if (!postRow) {
    return null;
  }

  const [tagLinks, authorLinks, fields, values] = await Promise.all([
    db
      .select({ id: postToTag.b })
      .from(postToTag)
      .where(eq(postToTag.a, postId)),
    db
      .select({ id: postToAuthor.a })
      .from(postToAuthor)
      .where(eq(postToAuthor.b, postId)),
    getDashboardCustomFields(workspaceId),
    db.query.fieldValue.findMany({
      where: and(
        eq(fieldValue.postId, postId),
        eq(fieldValue.workspaceId, workspaceId)
      ),
    }),
  ]);

  const valueMap: Record<string, string> = {};
  for (const value of values) {
    valueMap[value.fieldId] = value.value;
  }

  const post: PostValues = {
    slug: postRow.slug,
    title: postRow.title,
    status: postRow.status as PostValues["status"],
    featured: postRow.featured,
    content: postRow.content,
    coverImage: postRow.coverImage,
    description: postRow.description,
    publishedAt: postRow.publishedAt,
    contentJson: JSON.stringify(postRow.contentJson),
    tags: tagLinks.map((tag) => tag.id),
    category: postRow.categoryId ?? "",
    authors: authorLinks.map((authorRow) => authorRow.id),
  };

  return {
    fields,
    values: buildEditorValues(fields, post, valueMap),
  };
}
