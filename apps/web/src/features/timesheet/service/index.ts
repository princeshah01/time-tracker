import { apiFetch } from "@/shared/lib";
import type {
  CreateTimesheetInput,
  ListTimesheetsResponse,
  TimesheetListItem,
  UpdateTimesheetInput,
} from "../timesheet.types";

export const timesheetService = {
  listTimesheets(input: {
    page: number;
    limit: number;
    q?: string;
    projectName?: string;
  }) {
    return apiFetch<ListTimesheetsResponse>({
      method: "GET",
      url: "/timesheets",
      params: {
        page: input.page,
        limit: input.limit,
        q: input.q ?? "",
        projectName: input.projectName ?? "",
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
};
