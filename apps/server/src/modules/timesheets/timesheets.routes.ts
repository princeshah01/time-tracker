import { Router } from "express";

import { permissionKeys } from "@/shared/constants/role-permission";
import { requireAuth, requirePermission, validate } from "@/shared/middlewares";
import { timesheetsController } from "./timesheets.controllers";
import {
  createTimesheetSchema,
  listTimesheetSheetsSchema,
  listTimesheetsSchema,
  searchTimesheetTasksSchema,
  setTimesheetSheetLeaveSchema,
  setTimesheetSheetVerificationSchema,
  timesheetIdParamSchema,
  updateTimesheetSchema,
  upsertTimesheetSheetSchema,
} from "./timesheets.validation";

const timesheetsRouter = Router();

timesheetsRouter.use(requireAuth);

timesheetsRouter.get(
  "/",
  requirePermission([
    permissionKeys.timesheetViewAll,
    permissionKeys.timesheetViewOwn,
  ]),
  validate(listTimesheetsSchema),
  timesheetsController.list
);

timesheetsRouter.post(
  "/",
  requirePermission(permissionKeys.timesheetCreate),
  validate(createTimesheetSchema),
  timesheetsController.create
);

timesheetsRouter.get(
  "/:timesheetId/sheets",
  requirePermission([
    permissionKeys.timesheetViewAll,
    permissionKeys.timesheetViewOwn,
  ]),
  validate(listTimesheetSheetsSchema),
  timesheetsController.listSheets
);

timesheetsRouter.patch(
  "/:timesheetId/sheets",
  requirePermission(permissionKeys.timesheetFill),
  validate(upsertTimesheetSheetSchema),
  timesheetsController.upsertSheet
);

timesheetsRouter.patch(
  "/:timesheetId/sheets/leave",
  requirePermission(permissionKeys.timesheetFill),
  validate(setTimesheetSheetLeaveSchema),
  timesheetsController.setSheetLeave
);

timesheetsRouter.patch(
  "/:timesheetId/sheets/verification",
  requirePermission(permissionKeys.timesheetApprove),
  validate(setTimesheetSheetVerificationSchema),
  timesheetsController.setSheetVerification
);

timesheetsRouter.get(
  "/:timesheetId/tasks/search",
  requirePermission(permissionKeys.timesheetFill),
  validate(searchTimesheetTasksSchema),
  timesheetsController.searchTasks
);

timesheetsRouter.get(
  "/:timesheetId",
  requirePermission([
    permissionKeys.timesheetViewAll,
    permissionKeys.timesheetViewOwn,
  ]),
  validate(timesheetIdParamSchema),
  timesheetsController.view
);

timesheetsRouter.patch(
  "/:timesheetId",
  requirePermission(permissionKeys.timesheetCreate),
  validate(updateTimesheetSchema),
  timesheetsController.update
);

export { timesheetsRouter };
