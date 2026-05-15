import { AppError } from "@/shared/utils";
import { TimesheetsRepository } from "./timesheets.repository";
import type {
  CreateTimesheetInput,
  ListTimesheetSheetsInput,
  ListTimesheetsInput,
  SearchTimesheetTasksInput,
  SetTimesheetSheetLeaveInput,
  UpdateTimesheetInput,
  UpsertTimesheetSheetInput,
} from "./timesheets.validation";

type TimesheetRecord = NonNullable<
  Awaited<ReturnType<TimesheetsRepository["findTimesheetById"]>>
>;

type TimesheetUser = TimesheetRecord["users"][number];
type SheetEntryRecord = Awaited<
  ReturnType<TimesheetsRepository["listSheetEntriesForRows"]>
>[number];
type SheetDayLeaveRecord = Awaited<
  ReturnType<TimesheetsRepository["listSheetDayLeavesForRows"]>
>[number];
type SheetEntryInput = NonNullable<
  UpsertTimesheetSheetInput["entries"]
>[number];

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
    const dayLeaves = await this.timesheetsRepository.listSheetDayLeavesForRows(
      {
        timesheetId,
        userIds: entryUsers,
        leaveDates: entryDates,
      }
    );
    const entriesByKey = new Map<string, SheetEntryRecord[]>();
    const leaveByKey = new Map(
      dayLeaves.map((leave) => [
        this.getSheetEntryKey(leave.userId, leave.leaveDate),
        leave,
      ])
    );

    for (const entry of entries) {
      const key = this.getSheetEntryKey(entry.userId, entry.entryDate);
      const rowEntries = entriesByKey.get(key) ?? [];

      rowEntries.push(entry);
      entriesByKey.set(key, rowEntries);
    }

    return {
      items: pageCoordinates.map((coordinate) =>
        this.toSheetRow({
          date: coordinate.date,
          user: coordinate.user,
          entries: entriesByKey.get(
            this.getSheetEntryKey(coordinate.user.id, coordinate.date)
          ),
          explicitLeave: leaveByKey.get(
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

    if (this.isWeekend(entryDate)) {
      throw new AppError({
        message: "Weekend rows are mandatory weekly off days",
        code: "VALIDATION_ERROR",
      });
    }

    const explicitLeave = await this.timesheetsRepository.findSheetDayLeave({
      timesheetId,
      userId: targetUserId,
      leaveDate: entryDate,
    });

    if (explicitLeave) {
      throw new AppError({
        message: "Leave rows cannot be filled",
        code: "VALIDATION_ERROR",
      });
    }

    const sheetEntries = await this.resolveSheetEntries({
      input,
      projectId: timesheet.projectId,
      requesterId,
    });

    await this.timesheetsRepository.replaceSheetEntries({
      timesheetId,
      userId: targetUserId,
      entryDate,
      entries: sheetEntries,
    });

    const entries = await this.timesheetsRepository.listSheetEntriesForRows({
      timesheetId,
      userIds: [targetUserId],
      entryDates: [entryDate],
    });

    return this.toSheetRow({
      date: entryDate,
      user: targetUser,
      entries,
    });
  }

  async setSheetDayLeave(
    timesheetId: number,
    input: SetTimesheetSheetLeaveInput,
    requesterId: string
  ) {
    const timesheet = await this.requireTimesheetAccess(
      timesheetId,
      requesterId
    );
    const targetUser = timesheet.users.find((user) => user.id === requesterId);

    if (!targetUser) {
      throw new AppError({
        message: "Timesheet not found",
        code: "NOT_FOUND",
      });
    }

    const leaveDate = this.normalizeSheetDate(input.entryDate);

    if (
      !this.isDateInRange(leaveDate, timesheet.startDate, timesheet.endDate)
    ) {
      throw new AppError({
        message: "Leave date must be inside the timesheet date range",
        code: "VALIDATION_ERROR",
      });
    }

    if (this.isWeekend(leaveDate)) {
      throw new AppError({
        message: "Weekend rows are mandatory weekly off days",
        code: "VALIDATION_ERROR",
      });
    }

    if (input.isLeave) {
      await this.timesheetsRepository.markSheetDayLeave({
        timesheetId,
        userId: requesterId,
        leaveDate,
        createdBy: requesterId,
      });
    } else {
      await this.timesheetsRepository.unmarkSheetDayLeave({
        timesheetId,
        userId: requesterId,
        leaveDate,
      });
    }

    const entries = await this.timesheetsRepository.listSheetEntriesForRows({
      timesheetId,
      userIds: [requesterId],
      entryDates: [leaveDate],
    });
    const explicitLeave = await this.timesheetsRepository.findSheetDayLeave({
      timesheetId,
      userId: requesterId,
      leaveDate,
    });

    return this.toSheetRow({
      date: leaveDate,
      user: targetUser,
      entries,
      explicitLeave: explicitLeave ?? undefined,
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

  private async resolveSheetEntries(input: {
    input: UpsertTimesheetSheetInput;
    projectId: number;
    requesterId: string;
  }) {
    const entries = input.input.entries ?? [
      {
        taskId: input.input.taskId,
        taskTitle: input.input.taskTitle,
        taskStatus: input.input.taskStatus,
        hours: input.input.hours ?? 0,
        minutes: input.input.minutes ?? 0,
      },
    ];

    const resolvedEntries = [];

    for (const entry of entries) {
      const minutesSpent = entry.hours * 60 + entry.minutes;

      if (minutesSpent === 0) continue;

      const taskId = await this.resolveSheetTaskId({
        input: entry,
        projectId: input.projectId,
        minutesSpent,
        requesterId: input.requesterId,
      });

      resolvedEntries.push({
        taskId,
        minutesSpent,
        createdBy: input.requesterId,
      });
    }

    return resolvedEntries;
  }

  private async resolveSheetTaskId(input: {
    input: SheetEntryInput;
    projectId: number;
    minutesSpent: number;
    requesterId: string;
  }) {
    if (input.minutesSpent === 0) return null;

    if (input.input.taskId) {
      const task = await this.timesheetsRepository.findProjectTaskById(
        input.input.taskId,
        input.projectId
      );

      if (!task) {
        throw new AppError({
          message: "Selected task is not available for this timesheet",
          code: "VALIDATION_ERROR",
        });
      }

      if (input.input.taskStatus && input.input.taskStatus !== task.status) {
        await this.timesheetsRepository.updateTaskStatus({
          taskId: task.id,
          projectId: input.projectId,
          status: input.input.taskStatus,
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

    const task = await this.timesheetsRepository.createSheetTask({
      projectId: input.projectId,
      title: taskTitle,
      status: input.input.taskStatus ?? "todo",
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
    entries?: SheetEntryRecord[];
    explicitLeave?: SheetDayLeaveRecord;
  }) {
    const entries = input.entries ?? [];
    const rowEntries = entries.map((entry) => {
      const minutesSpent = entry.minutesSpent ?? 0;
      const task = entry.task?.id
        ? {
            id: entry.task.id,
            title: entry.task.title ?? "",
            status: entry.task.status ?? "todo",
          }
        : null;

      return {
        entryId: entry.id,
        task,
        minutesSpent,
        hours: Math.floor(minutesSpent / 60),
        minutes: minutesSpent % 60,
        updatedAt: entry.updatedAt,
      };
    });
    const minutesSpent = rowEntries.reduce(
      (total, entry) => total + entry.minutesSpent,
      0
    );
    const firstEntry = rowEntries[0];
    const isWeekend = this.isWeekend(input.date);
    const isExplicitLeave = Boolean(input.explicitLeave);

    return {
      rowKey: `${input.user.id}:${this.toDateKey(input.date)}`,
      date: input.date,
      user: input.user,
      isWeekend,
      isExplicitLeave,
      isLeave: isWeekend || isExplicitLeave,
      leaveType: isWeekend ? "weekly_off" : isExplicitLeave ? "leave" : null,
      entryId: firstEntry?.entryId ?? null,
      task: firstEntry?.task ?? null,
      entries: rowEntries,
      minutesSpent,
      hours: Math.floor(minutesSpent / 60),
      minutes: minutesSpent % 60,
      updatedAt: firstEntry?.updatedAt ?? null,
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

  private isWeekend(date: Date) {
    const day = this.normalizeSheetDate(date).getUTCDay();

    return day === 0 || day === 6;
  }
}

export const timesheetsService = new TimesheetsService();
