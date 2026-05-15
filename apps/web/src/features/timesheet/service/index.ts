import { apiFetch } from "@/shared/lib";
import type {
  CreateTimesheetInput,
  ListTimesheetSheetsResponse,
  ListTimesheetsResponse,
  SetTimesheetSheetLeaveInput,
  SetTimesheetSheetVerificationInput,
  TimesheetListItem,
  TimesheetSheetRow,
  TimesheetUser,
  TimesheetTaskSuggestion,
  UpdateTimesheetInput,
  UpsertTimesheetSheetInput,
} from "../timesheet.types";

export const timesheetService = {
  listTimesheets(input: {
    page: number;
    limit: number;
    q?: string;
    projectName?: string;
    projectId?: number;
  }) {
    return apiFetch<ListTimesheetsResponse>({
      method: "GET",
      url: "/timesheets",
      params: {
        page: input.page,
        limit: input.limit,
        q: input.q ?? "",
        projectName: input.projectName ?? "",
        ...(input.projectId ? { projectId: input.projectId } : {}),
      },
    });
  },

  createTimesheet(input: CreateTimesheetInput) {
    return apiFetch<TimesheetListItem>({
      method: "POST",
      url: "/timesheets",
      data: input,
    });
  },

  viewTimesheet(timesheetId: number) {
    return apiFetch<TimesheetListItem>({
      method: "GET",
      url: `/timesheets/${timesheetId}`,
    });
  },

  updateTimesheet(timesheetId: number, input: UpdateTimesheetInput) {
    return apiFetch<TimesheetListItem>({
      method: "PATCH",
      url: `/timesheets/${timesheetId}`,
      data: input,
    });
  },

  listSheets(input: {
    timesheetId: number;
    page: number;
    limit: number;
    userId?: string;
  }) {
    return apiFetch<ListTimesheetSheetsResponse>({
      method: "GET",
      url: `/timesheets/${input.timesheetId}/sheets`,
      params: {
        page: input.page,
        limit: input.limit,
        ...(input.userId ? { userId: input.userId } : {}),
      },
    });
  },

  searchSheetTasks(input: { timesheetId: number; q: string }) {
    return apiFetch<TimesheetTaskSuggestion[]>({
      method: "GET",
      url: `/timesheets/${input.timesheetId}/tasks/search`,
      params: {
        q: input.q,
        limit: 5,
      },
    });
  },

  upsertSheet(timesheetId: number, input: UpsertTimesheetSheetInput) {
    return apiFetch<TimesheetSheetRow>({
      method: "PATCH",
      url: `/timesheets/${timesheetId}/sheets`,
      data: input,
    });
  },

  setSheetLeave(timesheetId: number, input: SetTimesheetSheetLeaveInput) {
    return apiFetch<TimesheetSheetRow>({
      method: "PATCH",
      url: `/timesheets/${timesheetId}/sheets/leave`,
      data: input,
    });
  },

  setSheetVerification(
    timesheetId: number,
    input: SetTimesheetSheetVerificationInput
  ) {
    return apiFetch<TimesheetUser>({
      method: "PATCH",
      url: `/timesheets/${timesheetId}/sheets/verification`,
      data: input,
    });
  },
};
