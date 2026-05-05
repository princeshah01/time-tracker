import type { InvitationRoleOption, InvitationRow } from "./invitations.types";

export const INVITATION_ROLE_OPTIONS: InvitationRoleOption[] = [
  { id: "1", name: "admin" },
  { id: "2", name: "manager" },
  { id: "3", name: "teamlead" },
  { id: "4", name: "developer" },
  { id: "5", name: "guest" },
];

export const INVITATION_EMAIL_SUGGESTIONS = [
  "anika.patel@company.com",
  "dev.shah@company.com",
  "maya.singh@company.com",
  "nolan.rivera@company.com",
  "sarah.chen@company.com",
];

export const INVITATION_ROWS: InvitationRow[] = [
  {
    id: "inv-001",
    email: "anika.patel@company.com",
    roleName: "manager",
    status: "pending",
    createdAt: "2026-05-05T09:30:00.000Z",
    invitedBy: {
      name: "Prince Shah",
      email: "prince@company.com",
    },
  },
  {
    id: "inv-002",
    email: "dev.shah@company.com",
    roleName: "developer",
    status: "accepted",
    createdAt: "2026-05-04T13:15:00.000Z",
    invitedBy: {
      name: "Prince Shah",
      email: "prince@company.com",
    },
  },
  {
    id: "inv-003",
    email: "maya.singh@company.com",
    roleName: "teamlead",
    status: "expired",
    createdAt: "2026-04-25T11:00:00.000Z",
    invitedBy: {
      name: "Riya Mehta",
      email: "riya@company.com",
    },
  },
];
