import type { PlanType } from "@/lib/plans";

export interface WorkspaceMember {
  id: string;
  role: string | null;
  organizationId: string;
  createdAt: Date | string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface WorkspaceInvitation {
  id: string;
  email: string;
  role: string | null;
  status: string;
  organizationId: string;
  inviterId: string;
  expiresAt: Date | string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  timezone: string | null;
  createdAt: Date | string;
  currentUserRole: string | null;
  members?: WorkspaceMember[];
  invitations?: WorkspaceInvitation[];
  subscription: {
    id: string;
    status: string;
    plan: PlanType;
    activePlan: PlanType;
    currentPeriodStart?: string | Date;
    currentPeriodEnd?: string | Date;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: string | Date | null;
  } | null;
}

export interface WorkspaceContextType {
  activeWorkspace: Workspace | null;
  updateActiveWorkspace: (workspace: Partial<Workspace>) => Promise<void>;
  refreshActiveWorkspace: () => Promise<void>;
  workspaceList: Workspace[] | null;
  isFetchingWorkspace: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  currentUserRole: string | null;
}

export interface WorkspaceProviderProps {
  children: React.ReactNode;
  initialWorkspace: Workspace | null;
  workspaceSlug: string;
}
