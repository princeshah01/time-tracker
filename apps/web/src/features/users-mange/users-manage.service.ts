import { apiFetch } from "@/shared/lib";
import type {
  ListUsersResponse,
  UpdateUserInput,
  UpsertUserSalaryInput,
  UserDetail,
  UserFinancials,
  UserSearchRequestBody,
  UserSearchResponse,
  UserStatusFilter,
} from "./users-manage.types";

const userManageService = {
  listUsers: async (input: {
    page: number;
    limit: number;
    q?: string;
    status?: UserStatusFilter;
    role?: string;
  }) => {
    return apiFetch<ListUsersResponse>({
      url: "/users",
      method: "GET",
      params: {
        page: input.page,
        limit: input.limit,
        q: input.q ?? "",
        ...(input.status ? { status: input.status } : {}),
        ...(input.role ? { role: input.role } : {}),
      },
    });
  },

  viewUser: async (userId: string) => {
    return apiFetch<UserDetail>({
      url: `/users/${userId}`,
      method: "GET",
    });
  },

  updateUser: async (userId: string, data: UpdateUserInput) => {
    return apiFetch<UserDetail>({
      url: `/users/${userId}`,
      method: "PATCH",
      data,
    });
  },

  sendPasswordReset: async (userId: string) => {
    return apiFetch<{ email: string; sent: boolean }>({
      url: `/users/${userId}/reset-password`,
      method: "POST",
    });
  },

  getUserFinancials: async (userId: string) => {
    return apiFetch<UserFinancials>({
      url: `/users/${userId}/financial`,
      method: "GET",
    });
  },

  createUserSalary: async (userId: string, data: UpsertUserSalaryInput) => {
    return apiFetch<UserFinancials>({
      url: `/users/${userId}/financial/salaries`,
      method: "POST",
      data,
    });
  },

  updateUserSalary: async (
    userId: string,
    salaryId: number,
    data: Partial<UpsertUserSalaryInput>
  ) => {
    return apiFetch<UserFinancials>({
      url: `/users/${userId}/financial/salaries/${salaryId}`,
      method: "PATCH",
      data,
    });
  },

  searchUsers: async (body: UserSearchRequestBody) => {
    const response = await apiFetch<UserSearchResponse>({
      url: "/users/search",
      method: "POST",
      data: body,
    });
    return response;
  },
};

export { userManageService };
