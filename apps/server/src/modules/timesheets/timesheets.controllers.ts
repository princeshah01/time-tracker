import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/middlewares";
import { requireRouteUser } from "@/shared/session";
import { sendSuccess } from "@/shared/utils";
import { timesheetsService } from "./timesheets.service";
import type {
  createTimesheetSchema,
  listTimesheetSheetsSchema,
  listTimesheetsSchema,
  searchTimesheetTasksSchema,
  timesheetIdParamSchema,
  updateTimesheetSchema,
  upsertTimesheetSheetSchema,
} from "./timesheets.validation";

export class TimesheetsController {
  async create(req: Request, res: Response) {
    const { body } = (req as ValidatedRequest<typeof createTimesheetSchema>)
      .validated;
    const user = requireRouteUser(req);
    const timesheet = await timesheetsService.createTimesheet(body, user.id);

    return sendSuccess({
      res,
      data: timesheet,
      message: "Timesheet created successfully",
      status: 201,
    });
  }

  async list(req: Request, res: Response) {
    const { query } = (req as ValidatedRequest<typeof listTimesheetsSchema>)
      .validated;
    const user = requireRouteUser(req);
    const timesheets = await timesheetsService.listTimesheets(query, user.id);

    return sendSuccess({
      res,
      data: timesheets,
      message: "Timesheets fetched successfully",
    });
  }

  async view(req: Request, res: Response) {
    const { params } = (req as ValidatedRequest<typeof timesheetIdParamSchema>)
      .validated;
    const user = requireRouteUser(req);
    const timesheet = await timesheetsService.getTimesheet(
      params.timesheetId,
      user.id
    );

    return sendSuccess({
      res,
      data: timesheet,
      message: "Timesheet fetched successfully",
    });
  }

  async update(req: Request, res: Response) {
    const { params, body } = (
      req as ValidatedRequest<typeof updateTimesheetSchema>
    ).validated;
    const user = requireRouteUser(req);
    const timesheet = await timesheetsService.updateTimesheet(
      params.timesheetId,
      body,
      user.id
    );

    return sendSuccess({
      res,
      data: timesheet,
      message: "Timesheet updated successfully",
    });
  }

  async listSheets(req: Request, res: Response) {
    const { params, query } = (
      req as ValidatedRequest<typeof listTimesheetSheetsSchema>
    ).validated;
    const user = requireRouteUser(req);
    const sheets = await timesheetsService.listSheetRows(
      params.timesheetId,
      query,
      user.id
    );

    return sendSuccess({
      res,
      data: sheets,
      message: "Timesheet sheets fetched successfully",
    });
  }

  async searchTasks(req: Request, res: Response) {
    const { params, query } = (
      req as ValidatedRequest<typeof searchTimesheetTasksSchema>
    ).validated;
    const user = requireRouteUser(req);
    const tasks = await timesheetsService.searchSheetTasks(
      params.timesheetId,
      query,
      user.id
    );

    return sendSuccess({
      res,
      data: tasks,
      message: "Timesheet task suggestions fetched successfully",
    });
  }

  async upsertSheet(req: Request, res: Response) {
    const { params, body } = (
      req as ValidatedRequest<typeof upsertTimesheetSheetSchema>
    ).validated;
    const user = requireRouteUser(req);
    const sheet = await timesheetsService.upsertSheetRow(
      params.timesheetId,
      body,
      user.id
    );

    return sendSuccess({
      res,
      data: sheet,
      message: "Timesheet sheet saved successfully",
    });
  }
}

export const timesheetsController = new TimesheetsController();
