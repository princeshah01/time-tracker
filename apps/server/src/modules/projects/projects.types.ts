import type {
  projectBillingType,
  projectPriority,
  projectTeamRole,
} from "@/db/schema";

export type ProjectPriority = (typeof projectPriority.enumValues)[number];
export type ProjectBillingType = (typeof projectBillingType.enumValues)[number];
export type ProjectTeamRole = (typeof projectTeamRole.enumValues)[number];

export type ProjectTeamMemberInput = {
  userId: string;
  role: ProjectTeamRole;
  hourlyRate?: number | null;
};
