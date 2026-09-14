"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardBody } from "@/components/layout/wrapper";
import { MembersSettingsSkeleton } from "@/components/settings/loading-skeletons";
import { columns, type TeamMemberRow } from "@/components/team/columns";
import { TeamDataTable } from "@/components/team/data-table";
import { InviteSection } from "@/components/team/invite-section";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { QUERY_KEYS } from "@/lib/queries/keys";
import { useUser } from "@/providers/user";
import { useWorkspace } from "@/providers/workspace";
import type {
  WorkspaceInvitation,
  WorkspaceMember,
} from "@/types/workspace";
import { request } from "@/utils/fetch/client";

const InviteModal = dynamic(() =>
  import("@/components/team/invite-modal").then((mod) => mod.InviteModal)
);

const LeaveWorkspaceModal = dynamic(() =>
  import("@/components/team/leave-workspace").then(
    (mod) => mod.LeaveWorkspaceModal
  )
);

function PageClient({
  initialTeam,
  workspaceSlug,
}: {
  initialTeam?: {
    members: WorkspaceMember[];
    invitations: WorkspaceInvitation[];
  };
  workspaceSlug: string;
}) {
  const { user } = useUser();
  const { activeWorkspace, isFetchingWorkspace, currentUserRole } =
    useWorkspace();
  const workspaceId = useWorkspaceId();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLeaveWorkspaceModal, setShowLeaveWorkspaceModal] = useState(false);

  const { data: team, isPending } = useQuery({
    queryKey: workspaceId
      ? QUERY_KEYS.TEAM(workspaceId)
      : ["team", "disabled"],
    queryFn: async () => {
      const response = await request<{
        members: WorkspaceMember[];
        invitations: WorkspaceInvitation[];
      }>(`workspaces/${workspaceSlug}/team`);
      return response.data;
    },
    enabled: Boolean(workspaceId) && !isFetchingWorkspace,
    initialData: initialTeam,
    staleTime: 1000 * 60,
  });

  if (isFetchingWorkspace || !activeWorkspace || !user || isPending || !team) {
    return <MembersSettingsSkeleton />;
  }

  const data: TeamMemberRow[] = team.members.map((member) => ({
    id: member.id,
    type: "member" as const,
    name: member.user.name || member.user.email,
    email: member.user.email,
    image: member.user.image || null,
    role: member.role as "owner" | "admin" | "member",
    status: "accepted" as const,
    joinedAt: new Date(member.createdAt),
    userId: member.userId,
  }));

  return (
    <DashboardBody size="compact">
      <div className="space-y-6">
        <TeamDataTable
          columns={columns}
          currentUserId={user.id}
          currentUserRole={
            currentUserRole as "owner" | "admin" | "member" | undefined
          }
          data={data}
          setShowInviteModal={setShowInviteModal}
          setShowLeaveWorkspaceModal={setShowLeaveWorkspaceModal}
        />

        <InviteSection invitations={team.invitations || []} />
      </div>

      <InviteModal open={showInviteModal} setOpen={setShowInviteModal} />
      <LeaveWorkspaceModal
        id={activeWorkspace.id}
        name={activeWorkspace.name}
        open={showLeaveWorkspaceModal}
        setOpen={setShowLeaveWorkspaceModal}
      />
    </DashboardBody>
  );
}

export default PageClient;
