import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/middlewares";
import { requireRouteUser } from "@/shared/session";
import { sendSuccess } from "@/shared/utils";
import { clientsService } from "./clients.service";
import type {
  createClientSchema,
  listClientsSchema,
  updateClientSchema,
} from "./clients.validation";

export class ClientsController {
  async create(req: Request, res: Response) {
    const { body } = (req as ValidatedRequest<typeof createClientSchema>)
      .validated;
    const user = requireRouteUser(req);
    const client = await clientsService.createClient(body, user.id);

    return sendSuccess({
      res,
      data: client,
      message: "Client created successfully",
      status: 201,
    });
  }

  async list(req: Request, res: Response) {
    const { query } = (req as ValidatedRequest<typeof listClientsSchema>)
      .validated;
    const user = requireRouteUser(req);
    const clients = await clientsService.listClients(query, user.id);

    return sendSuccess({
      res,
      data: clients,
      message: "Clients fetched successfully",
    });
  }

  async update(req: Request, res: Response) {
    const { params, body } = (
      req as ValidatedRequest<typeof updateClientSchema>
    ).validated;
    const user = requireRouteUser(req);
    const client = await clientsService.updateClient(
      params.clientId,
      body,
      user.id
    );

    return sendSuccess({
      res,
      data: client,
      message: "Client updated successfully",
    });
  }
}

export const clientsController = new ClientsController();
