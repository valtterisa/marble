import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./server";

interface GetServerSessionOptions {
  allowUnverified?: boolean;
}

export const getServerSession = cache(
  async (options: GetServerSessionOptions = {}) => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!(options.allowUnverified ?? false) && !session?.user.emailVerified) {
        return null;
      }

      return session;
    } catch (error) {
      console.error("Error getting server session", error);
      return null;
    }
  }
);
