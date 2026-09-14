import type { authClient } from "./client";
import type { auth } from "./server";

type InferredSession = typeof auth.$Infer.Session;

export type Session = {
  user: InferredSession["user"];
  session: Omit<InferredSession["session"], "activeOrganizationId"> & {
    activeOrganizationId?: string | null;
  };
};

export type ActiveOrganization = typeof authClient.$Infer.ActiveOrganization;
export type Organization = typeof authClient.$Infer.Organization;
export type Invitation = typeof authClient.$Infer.Invitation;
