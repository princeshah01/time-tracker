import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { PageContent } from "@/shared/components/page-content";
import { AppIcon } from "@/shared/components/app-icon";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { useAppSelector } from "@/app/store/hooks";
import { formatDate, hasPermission } from "@/shared/lib";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "@workspace/ui/components/sonner";
import { cn } from "@workspace/ui/lib/utils";

import { ClientForm, ClientProjects } from "../_components";
import { clientService } from "../service";
import type { CreateClientInput, UpdateClientInput } from "../client.types";

type ClientDetailsMode = "edit" | "view";
type ClientDetailsLocationState = {
  mode?: ClientDetailsMode;
} | null;

function ClientDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  const clientId = Number(params.clientId);
  const userPermissions = useAppSelector((state) => state.user.permissions);
  const canManageClient = hasPermission(userPermissions, [
    permissions.clientManageAll,
    permissions.clientManageOwn,
  ]);
  const locationState = location.state as ClientDetailsLocationState;
  const [mode, setMode] = useState<ClientDetailsMode>("view");

  useEffect(() => {
    if (locationState?.mode === "edit" && canManageClient) {
      setMode("edit");
      return;
    }

    setMode("view");
  }, [canManageClient, clientId, locationState?.mode]);

  const clientQuery = useQuery({
    queryKey: [QUERY_KEYS.CLIENT_DETAIL, clientId],
    enabled: Number.isFinite(clientId) && clientId > 0,
    queryFn: async () => {
      const response = await clientService.viewClient(clientId);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch client");
      }

      return response.data;
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async (input: CreateClientInput | UpdateClientInput) => {
      const response = await clientService.updateClient(
        clientId,
        input as UpdateClientInput
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update client");
      }

      return response.data;
    },
    onSuccess: (client) => {
      toast.success("Client updated successfully");
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLIENTS] });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CLIENT_DETAIL, client.id],
      });
      setMode("view");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const client = clientQuery.data;

  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header
        title="Client Details"
        className="sticky top-0 z-10"
      />
      <PageContent.Body className="min-h-0 overflow-y-auto">
        <div className="min-h-full max-w-4xl border-border border-r border-b bg-background">
          {clientQuery.isLoading ? (
            <ClientDetailsSkeleton />
          ) : clientQuery.isError ? (
            <ClientDetailsError onRetry={() => void clientQuery.refetch()} />
          ) : client ? (
            <>
              <section className="border-b">
                <div className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2
                        className="truncate text-base font-semibold"
                        title={client.name}
                      >
                        {client.name}
                      </h2>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-md text-[10px]",
                          client.isActive
                            ? "border-success bg-success/10 text-success"
                            : "border-muted bg-muted text-muted-foreground"
                        )}
                      >
                        {client.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {client.company ?? client.email}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border text-[12px] md:min-w-72">
                    <InfoTile
                      label="Projects"
                      value={String(client.projectTotal ?? 0)}
                    />
                    <InfoTile
                      label="Created"
                      value={formatDate(client.createdAt)}
                    />
                    <InfoTile
                      label="Updated"
                      value={formatDate(client.updatedAt)}
                    />
                    <InfoTile
                      label="Owner"
                      value={client.creator?.name ?? "-"}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-border py-2 pr-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-[12px]"
                    onClick={() => navigate("/clients")}
                  >
                    <AppIcon name="ChevronLeft" className="size-3.5" />
                    Back to list
                  </Button>
                  {mode === "view" && canManageClient ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Open client actions"
                        >
                          <AppIcon name="MoreHorizontal" className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          className="gap-2 text-[12px]"
                          onSelect={() => setMode("edit")}
                        >
                          <AppIcon name="Pencil" className="size-3.5" />
                          Edit client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </section>

              <ClientForm
                client={client}
                mode={mode}
                canSubmit={canManageClient}
                isSubmitting={updateClientMutation.isPending}
                onCancel={() => setMode("view")}
                onSubmit={(input) => updateClientMutation.mutate(input)}
              />

              <ClientProjects projects={client.projects ?? []} />
            </>
          ) : null}
        </div>
      </PageContent.Body>
    </PageContent.Root>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 bg-background px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="truncate text-[13px] font-medium" title={value}>
        {value}
      </div>
    </div>
  );
}

function ClientDetailsSkeleton() {
  return (
    <div className="space-y-0">
      <div className="border-b p-4">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientDetailsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="m-4 rounded-md border border-destructive/30 bg-destructive/5 p-4">
      <div className="font-medium text-[13px] text-destructive">
        Failed to load client
      </div>
      <p className="mt-1 text-[12px] text-muted-foreground">
        The selected client could not be fetched. Try again.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 h-8 text-[12px]"
        onClick={onRetry}
      >
        <AppIcon name="Loader" className="size-3.5" />
        Retry
      </Button>
    </div>
  );
}

export default ClientDetailsPage;
