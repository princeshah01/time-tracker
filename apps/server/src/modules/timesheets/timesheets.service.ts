import { AppError } from "@/shared/utils";
import { TimesheetsRepository } from "./timesheets.repository";
import type {
  CreateTimesheetInput,
  ListTimesheetSheetsInput,
  ListTimesheetsInput,
  SearchTimesheetTasksInput,
  UpdateTimesheetInput,
  UpsertTimesheetSheetInput,
} from "./timesheets.validation";

type TimesheetRecord = NonNullable<
  Awaited<ReturnType<TimesheetsRepository["findTimesheetById"]>>
>;

type TimesheetUser = TimesheetRecord["users"][number];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

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

  async listSheetRows(
    timesheetId: number,
    input: ListTimesheetSheetsInput,
    requesterId: string
  ) {
    const timesheet = await this.requireTimesheetAccess(
      timesheetId,
      requesterId
    );
    const canManageAllUsers = await this.canManageTimesheetUsers(
      timesheet,
      requesterId
    );
    const visibleUsers = this.resolveVisibleSheetUsers({
      timesheet,
      requesterId,
      canManageAllUsers,
      selectedUserId: input.userId,
    });
    const dates = this.buildSheetDates(timesheet.startDate, timesheet.endDate);
    const total = dates.length * visibleUsers.length;
    const offset = (input.page - 1) * input.limit;
    const pageCoordinates = this.buildPageCoordinates({
      dates,
      users: visibleUsers,
      offset,
      limit: input.limit,
    });
    const entryDates = [...new Set(pageCoordinates.map((item) => item.date))];
    const entryUsers = [
      ...new Set(pageCoordinates.map((item) => item.user.id)),
    ];
    const entries = await this.timesheetsRepository.listSheetEntriesForRows({
      timesheetId,
      userIds: entryUsers,
      entryDates,
    });
    const entryByKey = new Map(
      entries.map((entry) => [
        this.getSheetEntryKey(entry.userId, entry.entryDate),
        entry,
      ])
    );

    return {
      items: pageCoordinates.map((coordinate) =>
        this.toSheetRow({
          date: coordinate.date,
          user: coordinate.user,
          entry: entryByKey.get(
            this.getSheetEntryKey(coordinate.user.id, coordinate.date)
          ),
        })
      ),
      users: timesheet.users,
      canManageAllUsers,
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit),
      hasNextPage: input.page * input.limit < total,
    };
  }

  async searchSheetTasks(
    timesheetId: number,
    input: SearchTimesheetTasksInput,
    requesterId: string
  ) {
    const timesheet = await this.requireTimesheetAccess(
      timesheetId,
      requesterId
    );

    return this.timesheetsRepository.searchProjectTasks({
      projectId: timesheet.projectId,
      q: input.q,
      limit: input.limit,
    });
  }

  async upsertSheetRow(
    timesheetId: number,
    input: UpsertTimesheetSheetInput,
    requesterId: string
  ) {
    const timesheet = await this.requireTimesheetAccess(
      timesheetId,
      requesterId
    );
    const canManageAllUsers = await this.canManageTimesheetUsers(
      timesheet,
      requesterId
    );
    const targetUserId = input.userId ?? requesterId;

    if (!canManageAllUsers && targetUserId !== requesterId) {
      throw new AppError({
        message: "You can only fill your own timesheet rows",
        code: "FORBIDDEN",
      });
    }

    const targetUser = timesheet.users.find((user) => user.id === targetUserId);

    if (!targetUser) {
      throw new AppError({
        message: "Selected user does not belong to this timesheet",
        code: "VALIDATION_ERROR",
      });
    }

    const entryDate = this.normalizeSheetDate(input.entryDate);

    if (
      !this.isDateInRange(entryDate, timesheet.startDate, timesheet.endDate)
    ) {
      throw new AppError({
        message: "Entry date must be inside the timesheet date range",
        code: "VALIDATION_ERROR",
      });
    }

    const minutesSpent = input.hours * 60 + input.minutes;
    const taskId = await this.resolveSheetTaskId({
      input,
      projectId: timesheet.projectId,
      minutesSpent,
      requesterId,
    });

    await this.timesheetsRepository.upsertSheetEntry({
      timesheetId,
      userId: targetUserId,
      entryDate,
      taskId,
      minutesSpent,
      createdBy: requesterId,
    });

    const entry = await this.timesheetsRepository.findSheetEntry({
      timesheetId,
      userId: targetUserId,
      entryDate,
    });

    return this.toSheetRow({
      date: entryDate,
      user: targetUser,
      entry: entry ?? undefined,
    });
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

    const role = await this.timesheetsRepository.findProjectMemberRole(
      timesheet.projectId,
      requesterId
    );

    if (role === "manager" || role === "lead") return timesheet;

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

  private async canManageTimesheetUsers(
    timesheet: TimesheetRecord,
    requesterId: string
  ) {
    if (timesheet.createdBy === requesterId) return true;

    const role = await this.timesheetsRepository.findProjectMemberRole(
      timesheet.projectId,
      requesterId
    );

    return role === "manager" || role === "lead";
  }

  private resolveVisibleSheetUsers(input: {
    timesheet: TimesheetRecord;
    requesterId: string;
    canManageAllUsers: boolean;
    selectedUserId?: string;
  }) {
    const selectedUserId = input.selectedUserId?.trim();

    if (!input.canManageAllUsers) {
      if (selectedUserId && selectedUserId !== input.requesterId) {
        throw new AppError({
          message: "You can only view your own timesheet rows",
          code: "FORBIDDEN",
        });
      }

      const ownUser = input.timesheet.users.find(
        (user) => user.id === input.requesterId
      );

      if (!ownUser) {
        throw new AppError({
          message: "Timesheet not found",
          code: "NOT_FOUND",
        });
      }

      return [ownUser];
    }

    if (!selectedUserId) return input.timesheet.users;

    const selectedUser = input.timesheet.users.find(
      (user) => user.id === selectedUserId
    );

    if (!selectedUser) {
      throw new AppError({
        message: "Selected user does not belong to this timesheet",
        code: "VALIDATION_ERROR",
      });
    }

    return [selectedUser];
  }

  private async resolveSheetTaskId(input: {
    input: UpsertTimesheetSheetInput;
    projectId: number;
    minutesSpent: number;
    requesterId: string;
  }) {
    if (input.minutesSpent === 0) return null;

    if (input.input.taskId) {
      const task = await this.timesheetsRepository.findFillableTaskById(
        input.input.taskId,
        input.projectId
      );

      if (!task) {
        throw new AppError({
          message: "Selected task is not available for this timesheet",
          code: "VALIDATION_ERROR",
        });
      }

      return task.id;
    }

    const taskTitle = input.input.taskTitle?.trim();

    if (!taskTitle) {
      throw new AppError({
        message: "Task is required when time spent is greater than 0",
        code: "VALIDATION_ERROR",
      });
    }

    const task = await this.timesheetsRepository.createTodoTask({
      projectId: input.projectId,
      title: taskTitle,
      createdBy: input.requesterId,
    });

    if (!task) {
      throw new AppError({
        message: "Failed to create task",
        code: "INTERNAL_SERVER_ERROR",
        isOperational: false,
      });
    }

    return task.id;
  }

  private buildSheetDates(startDate: Date, endDate: Date) {
    const dates: Date[] = [];
    let current = this.normalizeSheetDate(startDate);
    const end = this.normalizeSheetDate(endDate);

    while (current.getTime() <= end.getTime()) {
      dates.push(current);
      current = new Date(current.getTime() + DAY_IN_MS);
    }

    return dates;
  }

  private buildPageCoordinates(input: {
    dates: Date[];
    users: TimesheetUser[];
    offset: number;
    limit: number;
  }) {
    const coordinates: { date: Date; user: TimesheetUser }[] = [];
    const end = input.offset + input.limit;
    let index = 0;

    for (const date of input.dates) {
      for (const user of input.users) {
        if (index >= input.offset && index < end) {
          coordinates.push({ date, user });
        }

        index += 1;
        if (index >= end) return coordinates;
      }
    }

    return coordinates;
  }

  private toSheetRow(input: {
    date: Date;
    user: TimesheetUser;
    entry?: Awaited<
      ReturnType<TimesheetsRepository["listSheetEntriesForRows"]>
    >[number];
  }) {
    const minutesSpent = input.entry?.minutesSpent ?? 0;
    const task = input.entry?.task?.id
      ? {
          id: input.entry.task.id,
          title: input.entry.task.title ?? "",
          status: input.entry.task.status ?? "todo",
        }
      : null;

    return {
      rowKey: `${input.user.id}:${this.toDateKey(input.date)}`,
      date: input.date,
      user: input.user,
      entryId: input.entry?.id ?? null,
      task,
      minutesSpent,
      hours: Math.floor(minutesSpent / 60),
      minutes: minutesSpent % 60,
      updatedAt: input.entry?.updatedAt ?? null,
    };
  }

  private getSheetEntryKey(userId: string, date: Date) {
    return `${userId}:${this.toDateKey(date)}`;
  }

  private normalizeSheetDate(date: Date) {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
  }

  private toDateKey(date: Date) {
    const normalized = this.normalizeSheetDate(date);

    return normalized.toISOString().slice(0, 10);
  }

  private isDateInRange(date: Date, startDate: Date, endDate: Date) {
    const value = this.normalizeSheetDate(date).getTime();

    return (
      value >= this.normalizeSheetDate(startDate).getTime() &&
      value <= this.normalizeSheetDate(endDate).getTime()
    );
  }
}

export const timesheetsService = new TimesheetsService();
