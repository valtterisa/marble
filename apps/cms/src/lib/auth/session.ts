import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./server";
import type { Session } from "./types";

interface GetServerSessionOptions {
  allowUnverified?: boolean;
}

export const getServerSession = cache(
  async (
    options: GetServerSessionOptions = {}
  ): Promise<Session | null> => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!(options.allowUnverified ?? false) && !session?.user.emailVerified) {
        return null;
      }

      return session as Session | null;
    } catch (error) {
      console.error("Error getting server session", error);
      return null;
    }
  }
);

export function getActiveOrganizationId(
  session: Session["session"] | null | undefined
): string | null {
  const organizationId = session?.activeOrganizationId;
  return typeof organizationId === "string" ? organizationId : null;
}
