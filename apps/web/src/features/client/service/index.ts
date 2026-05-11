import { apiFetch } from "@/shared/lib";
import type {
  ClientDetail,
  ClientStatusFilter,
  CreateClientInput,
  ListClientsResponse,
  UpdateClientInput,
} from "../client.types";

export const clientService = {
  listClients(input: {
    page: number;
    limit: number;
    q?: string;
    status?: ClientStatusFilter;
  }) {
    return apiFetch<ListClientsResponse>({
      method: "GET",
      url: "/clients",
      params: {
        page: input.page,
        limit: input.limit,
        q: input.q ?? "",
        ...(input.status && input.status !== "all"
          ? { status: input.status }
          : {}),
      },
    });
  },

  viewClient(clientId: number) {
    return apiFetch<ClientDetail>({
      method: "GET",
      url: `/clients/${clientId}`,
    });
  },

  createClient(input: CreateClientInput) {
    return apiFetch<ClientDetail>({
      method: "POST",
      url: "/clients",
      data: input,
    });
  },

  updateClient(clientId: number, input: UpdateClientInput) {
    return apiFetch<ClientDetail>({
      method: "PATCH",
      url: `/clients/${clientId}`,
      data: input,
    });
  },

  autocompleteClients(input: { q?: string }) {
    return apiFetch<{ clients: { label: string; value: number }[] }>({
      method: "GET",
      url: "/client/autocomplete",
      params: {
        q: input.q ?? "",
      },
    });
  },
};
