import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import debounce from "lodash.debounce";

import { PageContent } from "@/shared/components/page-content";
import { AppIcon } from "@/shared/components/app-icon";
import { PermissionsWrapper } from "@/shared/components/permission-wrapper";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { useAppSelector } from "@/app/store/hooks";
import { hasPermission } from "@/shared/lib/permissions";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";

import {
  ClientContextMenu,
  ClientFilters,
  ClientStatusDialog,
  ClientTable,
} from "../_components";
import { clientService } from "../service";
import type {
  ClientListItem,
  ClientMenuState,
  ClientStatusFilter,
} from "../client.types";

function ClientMainPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userPermissions = useAppSelector((state) => state.user.permissions);
  const canManageClients = hasPermission(userPermissions, [
    permissions.clientManageAll,
    permissions.clientManageOwn,
  ]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<ClientStatusFilter>("all");
  const [rowLimit, setRowLimit] = useState(0);
  const [menuState, setMenuState] = useState<ClientMenuState>(null);
  const [statusClient, setStatusClient] = useState<ClientListItem | null>(null);

  const debouncedFn = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value.trim());
      }, 500),
    []
  );

  useEffect(() => {
    debouncedFn(search);

    return () => {
      debouncedFn.cancel();
    };
  }, [search, debouncedFn]);

  const clientsQuery = useInfiniteQuery({
    queryKey: [QUERY_KEYS.CLIENTS, debouncedSearch, status, rowLimit],
    enabled: Boolean(rowLimit),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await clientService.listClients({
        page: pageParam,
        limit: rowLimit,
        q: debouncedSearch,
        status,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch clients");
      }

      return response.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (client: ClientListItem) => {
      const response = await clientService.updateClient(client.id, {
        isActive: !client.isActive,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update client");
      }

      return response.data;
    },
    onSuccess: (client) => {
      toast.success("Client status updated successfully");
      setStatusClient(null);
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLIENTS] });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CLIENT_DETAIL, client.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function viewClient(client: ClientListItem) {
    navigate(`/clients/${client.id}`);
  }

  function editClient(client: ClientListItem) {
    navigate(`/clients/${client.id}`, { state: { mode: "edit" } });
  }

  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header title="Clients" className="sticky top-0 z-10" />
      <PageContent.Body className="min-h-0 overflow-y-auto">
        <div className="space-y-4 p-4 bg-background">
          <div className="flex items-center justify-between">
            <ClientFilters
              search={search}
              status={status}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
            />
            <PermissionsWrapper
              requiredPermissions={[permissions.clientCreate]}
            >
              <Button
                size="sm"
                className="h-8 gap-1.5 text-[12px]"
                onClick={() => navigate("/clients/new")}
              >
                <AppIcon name="Plus" className="size-3.5" />
                Add Client
              </Button>
            </PermissionsWrapper>
          </div>
          <ClientTable
            data={clientsQuery.data}
            isLoading={clientsQuery.isLoading}
            hasNextPage={clientsQuery.hasNextPage}
            isFetchingNextPage={clientsQuery.isFetchingNextPage}
            fetchNextPage={() => void clientsQuery.fetchNextPage()}
            setRowLimit={setRowLimit}
            canManage={canManageClients}
            onOpen={viewClient}
            onToggleStatus={setStatusClient}
            setMenuState={setMenuState}
          />
        </div>

        <ClientContextMenu
          menuState={menuState}
          canManage={canManageClients}
          setMenuState={setMenuState}
          onView={viewClient}
          onEdit={editClient}
          onToggleStatus={setStatusClient}
        />

        <ClientStatusDialog
          client={statusClient}
          open={Boolean(statusClient)}
          isPending={updateStatusMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setStatusClient(null);
          }}
          onConfirm={() => {
            if (statusClient) updateStatusMutation.mutate(statusClient);
          }}
        />
      </PageContent.Body>
    </PageContent.Root>
  );
}

export default ClientMainPage;
