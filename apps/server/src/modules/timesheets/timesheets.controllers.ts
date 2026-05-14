import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/middlewares";
import { requireRouteUser } from "@/shared/session";
import { sendSuccess } from "@/shared/utils";
import { timesheetsService } from "./timesheets.service";
import type {
  createTimesheetSchema,
  listTimesheetsSchema,
  timesheetIdParamSchema,
  updateTimesheetSchema,
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
}

export const timesheetsController = new TimesheetsController();
