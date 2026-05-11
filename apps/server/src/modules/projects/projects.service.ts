import { permissionsService } from "@/modules/permissions/permissions.service";
import { permissionKeys } from "@/shared/constants/role-permission";
import type { AccessScope } from "@/shared/types";
import { AppError } from "@/shared/utils";
import { moneyToDb, ProjectsRepository } from "./projects.repository";
import type {
  CreateProjectInput,
  ListProjectsInput,
  UpdateProjectBillingInput,
  UpdateProjectInput,
} from "./projects.validation";

type ProjectRecord = NonNullable<
  Awaited<ReturnType<ProjectsRepository["findProjectById"]>>
>;

type TeamMemberRecord = Awaited<
  ReturnType<ProjectsRepository["listTeamMembers"]>
>[number];

export class ProjectsService {
  constructor(private readonly projectsRepository = new ProjectsRepository()) {}

  async createProject(input: CreateProjectInput, requesterId: string) {
    await this.assertClientCanBeUsed(input.clientId);
    await this.assertTeamMembersExist(input.teamMembers);

    const { teamMembers, ...projectInput } = input;

    const project = await this.projectsRepository.createProject({
      ...projectInput,
      createdBy: requesterId,
      totalProjectIncome: null,
      teamMembers: this.normalizeTeamMembers(teamMembers),
    });

    if (!project) {
      throw new AppError({
        message: "Failed to create project",
        code: "INTERNAL_SERVER_ERROR",
        isOperational: false,
      });
    }

    return this.getProject(project.id, requesterId);
  }

  async listProjects(input: ListProjectsInput, requesterId: string) {
    const scope = await this.resolveViewScope(requesterId);
    const canViewFinance = await this.canManageFinance(requesterId);
    const result = await this.projectsRepository.listProjectsPaginated({
      ...input,
      requesterId,
      scope,
    });

    return {
      items: result.items.map((project) =>
        this.serializeListProject(project, canViewFinance)
      ),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
      hasNextPage: result.page * result.limit < result.total,
    };
  }

  async getProject(projectId: number, requesterId: string) {
    const scope = await this.resolveViewScope(requesterId);
    const canViewFinance = await this.canManageFinance(requesterId);
    const project = await this.requireProjectAccess(
      projectId,
      requesterId,
      scope
    );
    const teamMembers =
      await this.projectsRepository.listTeamMembers(projectId);

    return this.serializeProject(project, teamMembers, canViewFinance);
  }

  async updateProject(
    projectId: number,
    input: UpdateProjectInput,
    requesterId: string
  ) {
    const scope = await this.resolveManageScope(requesterId);
    await this.requireProjectAccess(projectId, requesterId, scope);
    if (input.clientId !== undefined) {
      await this.assertClientCanBeUsed(input.clientId);
    }

    if (input.teamMembers !== undefined) {
      await this.assertTeamMembersExist(input.teamMembers);
    }

    const { teamMembers, ...projectInput } = input;

    await this.projectsRepository.updateProject(projectId, {
      ...projectInput,
      teamMembers:
        teamMembers === undefined
          ? undefined
          : this.normalizeTeamMembers(teamMembers),
    });

    return this.getProject(projectId, requesterId);
  }

  async updateProjectBilling(
    projectId: number,
    input: UpdateProjectBillingInput,
    requesterId: string
  ) {
    await permissionsService.requirePermission(
      requesterId,
      permissionKeys.projectFinanceManagement
    );
    const scope = await this.resolveViewScope(requesterId);
    const project = await this.requireProjectAccess(
      projectId,
      requesterId,
      scope
    );

    if (
      project.billingType === "fixed_bill" &&
      input.totalProjectIncome === undefined
    ) {
      throw new AppError({
        message: "Total project income is required for fixed bill projects",
        code: "VALIDATION_ERROR",
      });
    }

    if (project.billingType === "hours_worked") {
      await this.assertBillingMembersBelongToProject(
        projectId,
        input.teamMembers ?? []
      );
    }

    await this.projectsRepository.updateProjectBilling(projectId, {
      totalProjectIncome:
        project.billingType === "fixed_bill" &&
        input.totalProjectIncome !== undefined
          ? moneyToDb(input.totalProjectIncome)
          : project.billingType === "hours_worked"
            ? null
            : undefined,
      teamMembers:
        project.billingType === "hours_worked"
          ? input.teamMembers?.map((member) => ({
              userId: member.userId,
              hourlyRate: moneyToDb(member.hourlyRate),
            }))
          : undefined,
    });

    return this.getProject(projectId, requesterId);
  }

  async toggleProjectStatus(projectId: number, requesterId: string) {
    const scope = await this.resolveManageScope(requesterId);
    const project = await this.requireProjectAccess(
      projectId,
      requesterId,
      scope
    );

    await this.projectsRepository.updateProject(projectId, {
      isActive: !project.isActive,
    });

    return this.getProject(projectId, requesterId);
  }

  private normalizeTeamMembers(teamMembers: CreateProjectInput["teamMembers"]) {
    return teamMembers.map((member) => ({
      userId: member.userId,
      role: member.role,
    }));
  }

  private async assertClientCanBeUsed(clientId: number) {
    const client = await this.projectsRepository.findClientById(clientId);

    if (!client) {
      throw new AppError({
        message: "Client not found",
        code: "NOT_FOUND",
      });
    }

    if (!client.isActive) {
      throw new AppError({
        message: "Inactive clients cannot be assigned to a project",
        code: "VALIDATION_ERROR",
      });
    }
  }

  private async assertTeamMembersExist(
    teamMembers: CreateProjectInput["teamMembers"]
  ) {
    const userIds = [...new Set(teamMembers.map((member) => member.userId))];
    const existingUsers =
      await this.projectsRepository.findExistingUserIds(userIds);
    const existingUserIds = new Set(existingUsers.map((record) => record.id));
    const missingUserIds = userIds.filter(
      (userId) => !existingUserIds.has(userId)
    );

    if (missingUserIds.length > 0) {
      throw new AppError({
        message: "One or more team members were not found",
        code: "VALIDATION_ERROR",
        details: { userIds: missingUserIds },
      });
    }
  }

  private async assertBillingMembersBelongToProject(
    projectId: number,
    teamMembers: UpdateProjectBillingInput["teamMembers"]
  ) {
    if (!teamMembers || teamMembers.length === 0) return;

    const existingMembers =
      await this.projectsRepository.listTeamMembers(projectId);
    const existingUserIds = new Set(
      existingMembers.map((member) => member.userId)
    );
    const missingUserIds = teamMembers
      .map((member) => member.userId)
      .filter((userId) => !existingUserIds.has(userId));

    if (missingUserIds.length > 0) {
      throw new AppError({
        message: "Billing can only be updated for project team members",
        code: "VALIDATION_ERROR",
        details: { userIds: missingUserIds },
      });
    }
  }

  private async requireProjectAccess(
    projectId: number,
    requesterId: string,
    scope: AccessScope
  ) {
    const project = await this.projectsRepository.findProjectById(projectId);

    if (!project) {
      throw new AppError({
        message: "Project not found",
        code: "NOT_FOUND",
      });
    }

    if (scope === "all") return project;

    const hasOwnAccess =
      project.createdBy === requesterId ||
      (await this.projectsRepository.hasProjectMembership(
        projectId,
        requesterId
      ));

    if (!hasOwnAccess) {
      throw new AppError({
        message: "Project not found",
        code: "NOT_FOUND",
      });
    }

    return project;
  }

  private serializeListProject(project: unknown, canViewFinance: boolean) {
    const record = project as {
      totalProjectIncome: string | null;
      [key: string]: unknown;
    };

    if (canViewFinance) return record;

    return {
      ...record,
      totalProjectIncome: null,
    };
  }

  private serializeProject(
    project: ProjectRecord,
    teamMembers: TeamMemberRecord[],
    canViewFinance: boolean
  ) {
    return {
      ...project,
      totalProjectIncome: canViewFinance ? project.totalProjectIncome : null,
      teamMembers: teamMembers.map((member) => ({
        ...member,
        hourlyRate: canViewFinance ? member.hourlyRate : null,
      })),
    };
  }

  private canManageFinance(userId: string) {
    return permissionsService.checkPermission(
      userId,
      permissionKeys.projectFinanceManagement
    );
  }

  private resolveViewScope(userId: string) {
    return permissionsService.requireAccessScope(userId, {
      all: permissionKeys.projectViewAll,
      own: permissionKeys.projectViewOwn,
    });
  }

  private resolveManageScope(userId: string) {
    return permissionsService.requireAccessScope(userId, {
      all: permissionKeys.projectManageAll,
      own: permissionKeys.projectManageOwn,
    });
  }
}

export const projectsService = new ProjectsService();
