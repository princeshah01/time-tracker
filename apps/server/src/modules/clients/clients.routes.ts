import { Router } from "express";

import { permissionKeys } from "@/shared/constants/role-permission";
import { requireAuth, requirePermission, validate } from "@/shared/middlewares";
import { clientsController } from "./clients.controllers";
import {
  autocompleteClientsSchema,
  createClientSchema,
  listClientsSchema,
  updateClientSchema,
  viewClientSchema,
} from "./clients.validation";

const clientsRouter = Router();

clientsRouter.use(requireAuth);

clientsRouter.get(
  "/",
  requirePermission([
    permissionKeys.clientViewAll,
    permissionKeys.clientViewOwn,
  ]),
  validate(listClientsSchema),
  clientsController.list
);

clientsRouter.post(
  "/",
  requirePermission(permissionKeys.clientCreate),
  validate(createClientSchema),
  clientsController.create
);

clientsRouter.get(
  "/autocomplete",
  requirePermission([
    permissionKeys.clientViewAll,
    permissionKeys.clientViewOwn,
  ]),
  validate(autocompleteClientsSchema),
  clientsController.autocomplete
);

clientsRouter.get(
  "/:clientId",
  requirePermission([
    permissionKeys.clientViewAll,
    permissionKeys.clientViewOwn,
  ]),
  validate(viewClientSchema),
  clientsController.view
);

clientsRouter.patch(
  "/:clientId",
  requirePermission([
    permissionKeys.clientManageAll,
    permissionKeys.clientManageOwn,
  ]),
  validate(updateClientSchema),
  clientsController.update
);

export { clientsRouter };
