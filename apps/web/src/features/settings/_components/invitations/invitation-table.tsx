import { useEffect, useMemo, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import debounce from "lodash.debounce";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";

import { AppIcon } from "@/shared/components/app-icon";
import { DataTable } from "@/shared/components/data-table";
import { cn } from "@workspace/ui/lib/utils";
import {
  InvitationFilters,
  type InvitationStatusFilter,
} from "./invitation-filters";
import { QUERY_KEYS } from "@/shared/constants";
import { settingsService } from "@/features/settings";
import type {
  InvitationListItem,
  InvitationStatus,
} from "@/features/settings/settings.type";
import { capitalize, formatTableDate } from "@/shared/lib";

const statusClassName: Record<InvitationStatus, string> = {
  pending: "border-warning bg-warning/10 text-warning",
  accepted: "border-success bg-success/10 text-success",
  expired: "border-muted bg-muted text-muted-foreground",
  revoked: "border-destructive bg-destructive/10 text-destructive",
};

function InvitationTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<InvitationStatusFilter>("all");
  const [rowLimit, setRowLimit] = useState(0);

  const debouncedFn = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value);
      }, 500),
    []
  );

  useEffect(() => {
    debouncedFn(search.trim());

    return () => {
      debouncedFn.cancel();
    };
  }, [search, debouncedFn]);

  const invitationsQuery = useInfiniteQuery({
    queryKey: [QUERY_KEYS.INVITATIONS, debouncedSearch, status, rowLimit],
    enabled: Boolean(rowLimit),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await settingsService.listInvitations({
        page: pageParam,
        limit: rowLimit,
        q: debouncedSearch,
        status: status === "all" ? undefined : status,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch invitations");
      }

      return response.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
  });

  const revokeInvitationMutation = useMutation({
    mutationFn: async (invitation: InvitationListItem) => {
      const response = await settingsService.revokeInvitation(invitation.id);

      if (!response.success) {
        throw new Error(response.message || "Failed to revoke invitation");
      }

      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Invitation revoked successfully");
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INVITATIONS],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INVITE_USER_SUGGESTIONS],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const invitations = useMemo(() => {
    return invitationsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  }, [invitationsQuery.data]);

  function revokeInvitation(invitation: InvitationListItem) {
    if (invitation.status === "accepted") {
      toast.error("Accepted invitations cannot be revoked.");
      return;
    }

    revokeInvitationMutation.mutate(invitation);
  }

  const columns = useMemo<ColumnDef<InvitationListItem>[]>(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="min-w-0">
            <span
              className="block truncate font-medium"
              title={row.original.email}
            >
              {capitalize(row.original.email)}
            </span>
            <span
              className="block truncate text-[12px] text-muted-foreground"
              title={row.original.role.name}
            >
              {capitalize(row.original.role.name)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatTableDate(row.original.createdAt),
      },
      {
        accessorKey: "invitedBy",
        header: "Invited By",
        cell: ({ row }) => (
          <div className="min-w-0">
            <span
              className="block truncate font-medium"
              title={row.original.invitedBy.name ?? "Unknown"}
            >
              {row.original.invitedBy.name ?? "Unknown"}
            </span>
            <span
              className="block truncate text-[12px] text-muted-foreground"
              title={row.original.invitedBy.email ?? "-"}
            >
              {row.original.invitedBy.email
                ? capitalize(row.original.invitedBy.email)
                : "-"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "capitalize text-[8px] rounded-md",
              statusClassName[row.original.status]
            )}
          >
            {row.original.status}
          </Badge>
        ),
        size: 100,
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            disabled={
              row.original.status === "accepted" ||
              row.original.status === "revoked" ||
              revokeInvitationMutation.isPending
            }
            onClick={(event) => {
              event.stopPropagation();
              revokeInvitation(row.original);
            }}
            aria-label="Revoke invitation"
          >
            <AppIcon name="Trash2" className="h-3.5 w-3.5" />
          </Button>
        ),
        size: 55,
      },
    ],
    [revokeInvitationMutation.isPending]
  );

  return (
    <div className="space-y-4 border-t p-4">
      <InvitationFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      <DataTable
        data={invitations}
        columns={columns}
        getRowId={(row) => String(row.id)}
        isLoading={invitationsQuery.isLoading}
        hasNextPage={invitationsQuery.hasNextPage}
        isFetchingNextPage={invitationsQuery.isFetchingNextPage}
        fetchNextPage={invitationsQuery.fetchNextPage}
        setRowLimit={setRowLimit}
        emptyText="No invitations found"
        containerClassName="h-[calc(100vh-320px)] min-h-72"
      />
    </div>
  );
}

export { InvitationTable };
