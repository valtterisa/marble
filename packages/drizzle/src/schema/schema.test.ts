import { getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import {
  account,
  invitation,
  member,
  session,
  shareLink,
  user,
  verification,
  workspace,
} from "./index";

describe("physical table mappings", () => {
  it("preserves Better Auth table names", () => {
    expect(
      [user, session, account, verification, workspace, member, invitation].map(
        getTableName
      )
    ).toEqual([
      "user",
      "session",
      "account",
      "verification",
      "workspace",
      "member",
      "invitation",
    ]);
  });

  it("preserves the PascalCase ShareLink table name", () => {
    expect(getTableName(shareLink)).toBe("ShareLink");
  });
});
