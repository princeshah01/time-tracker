import { apiFetch } from "@/shared/lib";
import type {
  CreateProjectInput,
  ListProjectsResponse,
  ProjectBillingType,
  ProjectDetail,
  ProjectPriority,
  ProjectStatusFilter,
  UpdateProjectBillingInput,
  UpdateProjectInput,
} from "../project.types";

export const projectService = {
  listProjects(input: {
    page: number;
    limit: number;
    q?: string;
    status?: ProjectStatusFilter;
    priority?: ProjectPriority | "all";
    billingType?: ProjectBillingType | "all";
  }) {
    return apiFetch<ListProjectsResponse>({
      method: "GET",
      url: "/projects",
      params: {
        page: input.page,
        limit: input.limit,
        q: input.q ?? "",
        ...(input.status && input.status !== "all"
          ? { status: input.status }
          : {}),
        ...(input.priority && input.priority !== "all"
          ? { priority: input.priority }
          : {}),
        ...(input.billingType && input.billingType !== "all"
          ? { billingType: input.billingType }
          : {}),
      },
    });
  },

  viewProject(projectId: number) {
    return apiFetch<ProjectDetail>({
      method: "GET",
      url: `/projects/${projectId}`,
    });
  },

  createProject(input: CreateProjectInput) {
    return apiFetch<ProjectDetail>({
      method: "POST",
      url: "/projects",
      data: input,
    });
  },

  updateProject(projectId: number, input: UpdateProjectInput) {
    return apiFetch<ProjectDetail>({
      method: "PATCH",
      url: `/projects/${projectId}`,
      data: input,
    });
  },

  toggleProjectStatus(projectId: number) {
    return apiFetch<ProjectDetail>({
      method: "PATCH",
      url: `/projects/${projectId}/disable`,
    });
  },

  updateProjectBilling(projectId: number, input: UpdateProjectBillingInput) {
    return apiFetch<ProjectDetail>({
      method: "PATCH",
      url: `/projects/${projectId}/billing`,
      data: input,
    });
  },
};
