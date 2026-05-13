export type UserSearchRequestBody = {
  q: string;
  type: "invite" | "skills" | "project-assign";
  role?: "manager" | "lead" | "member" | "employee";
  excludeSelf?: boolean;
  limit?: number;
};

export type UserSearchResponse = {
  suggestedUsers: {
    id?: string;
    email: string;
    name: string;
    role: string | null;
    image?: string | null;
    skills?: string[];
    canSendInvite?: boolean;
  }[];
};

export type UserStatusFilter = "active" | "inactive";

export type UserRoleSummary = {
  id: number | null;
  name: string | null;
  description: string | null;
  level: number | null;
};

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roleId: number | null;
  roleName: string | null;
  role: UserRoleSummary | null;
  skills: string[];
};

export type UserDetail = UserListItem;

export type UserSalaryHistoryItem = {
  id: number;
  userId: string;
  salary: string;
  effectiveDate: string;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserFinancials = {
  currentSalary: UserSalaryHistoryItem | null;
  nextSalary: UserSalaryHistoryItem | null;
  analytics: {
    hikeAmount: string | null;
    hikePercentage: string | null;
  };
  salaryHistory: UserSalaryHistoryItem[];
};

export type ListUsersResponse = {
  items: UserListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type UpdateUserInput = {
  isActive?: boolean;
  name?: string;
  roleId?: number | null;
  skills?: string[];
};

export type UpsertUserSalaryInput = {
  salary: number;
  effectiveDate: string;
  note?: string | null;
};
