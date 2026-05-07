import { permissionsService } from "@/modules/permissions/permissions.service";
import { permissionKeys } from "@/shared/constants/role-permission";
import type { AccessScope } from "@/shared/types";
import { AppError } from "@/shared/utils";
import { ClientsRepository } from "./clients.repository";
import type {
  CreateClientInput,
  ListClientsInput,
  UpdateClientInput,
} from "./clients.validation";

export class ClientsService {
  constructor(private readonly clientsRepository = new ClientsRepository()) {}

  async createClient(input: CreateClientInput, requesterId: string) {
    const client = await this.clientsRepository.createClient({
      ...input,
      createdBy: requesterId,
    });

    if (!client) {
      throw new AppError({
        message: "Failed to create client",
        code: "INTERNAL_SERVER_ERROR",
        isOperational: false,
      });
    }

    return this.viewClient(client.id, requesterId, "all");
  }

  async listClients(input: ListClientsInput, requesterId: string) {
    const scope = await this.resolveViewScope(requesterId);
    const result = await this.clientsRepository.listClientsPaginated({
      ...input,
      requesterId,
      scope,
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

  async updateClient(
    clientId: number,
    input: UpdateClientInput,
    requesterId: string
  ) {
    const scope = await this.resolveManageScope(requesterId);
    await this.viewClient(clientId, requesterId, scope);

    const client = await this.clientsRepository.updateClient(clientId, input);

    if (!client) {
      throw new AppError({
        message: "Client not found",
        code: "NOT_FOUND",
      });
    }

    return this.viewClient(client.id, requesterId, scope);
  }

  private async viewClient(
    clientId: number,
    requesterId: string,
    scope: AccessScope
  ) {
    const client = await this.clientsRepository.findClientById(clientId);

    if (!client || (scope === "own" && client.createdBy !== requesterId)) {
      throw new AppError({
        message: "Client not found",
        code: "NOT_FOUND",
      });
    }

    return client;
  }

  private resolveViewScope(userId: string) {
    return permissionsService.requireAccessScope(userId, {
      all: permissionKeys.clientViewAll,
      own: permissionKeys.clientViewOwn,
    });
  }

  private resolveManageScope(userId: string) {
    return permissionsService.requireAccessScope(userId, {
      all: permissionKeys.clientManageAll,
      own: permissionKeys.clientManageOwn,
    });
  }
}

export const clientsService = new ClientsService();
