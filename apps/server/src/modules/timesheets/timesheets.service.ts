import { AppError } from "@/shared/utils";
import { TimesheetsRepository } from "./timesheets.repository";
import type {
  CreateTimesheetInput,
  ListTimesheetsInput,
  UpdateTimesheetInput,
} from "./timesheets.validation";

type TimesheetRecord = NonNullable<
  Awaited<ReturnType<TimesheetsRepository["findTimesheetById"]>>
>;

export class TimesheetsService {
  constructor(
    private readonly timesheetsRepository = new TimesheetsRepository()
  ) {}

  async createTimesheet(input: CreateTimesheetInput, requesterId: string) {
    await this.requireProjectCreatorRole(input.projectId, requesterId);
    await this.assertUsersBelongToProject(input.projectId, input.userIds);

    const timesheet = await this.timesheetsRepository.createTimesheet({
      projectId: input.projectId,
      timesheetName: input.timesheetName.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
      userIds: input.userIds,
      createdBy: requesterId,
    });

    if (!timesheet) {
      throw new AppError({
        message: "Failed to create timesheet",
        code: "INTERNAL_SERVER_ERROR",
        isOperational: false,
      });
    }

    return this.getTimesheet(timesheet.id, requesterId);
  }

  async listTimesheets(input: ListTimesheetsInput, requesterId: string) {
    const result = await this.timesheetsRepository.listTimesheetsPaginated({
      ...input,
      requesterId,
    });

    return {
      items: result.items,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
      hasNextPage: result.page * result.limit < result.total,
    };
  }

  async getTimesheet(timesheetId: number, requesterId: string) {
    return this.requireTimesheetAccess(timesheetId, requesterId);
  }

  async updateTimesheet(
    timesheetId: number,
    input: UpdateTimesheetInput,
    requesterId: string
  ) {
    const timesheet = await this.requireTimesheetAccess(
      timesheetId,
      requesterId
    );
    const projectId = input.projectId ?? timesheet.projectId;
    const startDate = input.startDate ?? timesheet.startDate;
    const endDate = input.endDate ?? timesheet.endDate;

    if (endDate.getTime() < startDate.getTime()) {
      throw new AppError({
        message: "End date must be the same as or after start date",
        code: "VALIDATION_ERROR",
      });
    }

    await this.requireProjectCreatorRole(projectId, requesterId);

    if (input.userIds !== undefined) {
      await this.assertUsersBelongToProject(projectId, input.userIds);
    }

    await this.timesheetsRepository.updateTimesheet(timesheetId, {
      ...input,
      projectId,
      startDate,
      endDate,
      timesheetName: input.timesheetName?.trim(),
    });

    return this.getTimesheet(timesheetId, requesterId);
  }

  private async requireProjectCreatorRole(
    projectId: number,
    requesterId: string
  ) {
    const project = await this.timesheetsRepository.findProjectById(projectId);

    if (!project) {
      throw new AppError({
        message: "Project not found",
        code: "NOT_FOUND",
      });
    }

    const role = await this.timesheetsRepository.findProjectMemberRole(
      projectId,
      requesterId
    );

    if (role === "manager" || role === "lead") return;

    throw new AppError({
      message: "Only project leads and managers can create timesheets",
      code: "FORBIDDEN",
    });
  }

  private async assertUsersBelongToProject(
    projectId: number,
    userIds: string[]
  ) {
    const projectMembers =
      await this.timesheetsRepository.listProjectMembers(projectId);
    const projectMemberIds = new Set(
      projectMembers.map((member) => member.userId)
    );
    const missingUserIds = userIds.filter(
      (userId) => !projectMemberIds.has(userId)
    );

    if (missingUserIds.length > 0) {
      throw new AppError({
        message: "Timesheet users must belong to the selected project",
        code: "VALIDATION_ERROR",
        details: { userIds: missingUserIds },
      });
    }
  }

  private async requireTimesheetAccess(
    timesheetId: number,
    requesterId: string
  ): Promise<TimesheetRecord> {
    const timesheet =
      await this.timesheetsRepository.findTimesheetById(timesheetId);

    if (!timesheet) {
      throw new AppError({
        message: "Timesheet not found",
        code: "NOT_FOUND",
      });
    }

    if (timesheet.createdBy === requesterId) return timesheet;

    const isTimesheetUser = await this.timesheetsRepository.hasTimesheetUser(
      timesheetId,
      requesterId
    );

    if (!isTimesheetUser) {
      throw new AppError({
        message: "Timesheet not found",
        code: "NOT_FOUND",
      });
    }

    return timesheet;
  }
}

export const timesheetsService = new TimesheetsService();
