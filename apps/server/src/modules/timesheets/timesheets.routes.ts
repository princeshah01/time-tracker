import { Router } from "express";

import { permissionKeys } from "@/shared/constants/role-permission";
import { requireAuth, requirePermission, validate } from "@/shared/middlewares";
import { timesheetsController } from "./timesheets.controllers";
import {
  createTimesheetSchema,
  listTimesheetsSchema,
  timesheetIdParamSchema,
  updateTimesheetSchema,
} from "./timesheets.validation";

const timesheetsRouter = Router();

timesheetsRouter.use(requireAuth);

timesheetsRouter.get(
  "/",
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
  "/:timesheetId",
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
