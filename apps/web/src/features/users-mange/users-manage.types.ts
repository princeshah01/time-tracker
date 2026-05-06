export type UserSearchRequestBody = {
  q: string;
  type: "invite" | "skills";
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
  role: UserRoleSummary | null;
  skills: string[];
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
