import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

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
import { INVITATION_ROWS } from "./invitations.mock";
import type { InvitationRow, InvitationStatus } from "./invitations.types";

const statusClassName: Record<InvitationStatus, string> = {
  pending: "border-warning bg-warning/10 text-warning",
  accepted: "border-success bg-success/10 text-success",
  expired: "border-muted bg-muted text-muted-foreground",
  revoked: "border-destructive bg-destructive/10 text-destructive",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function InvitationTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvitationStatusFilter>("all");
  const [invitations, setInvitations] =
    useState<InvitationRow[]>(INVITATION_ROWS);

  const filteredInvitations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invitations.filter((invitation) => {
      const matchesStatus = status === "all" || invitation.status === status;
      const matchesSearch =
        !query ||
        invitation.email.toLowerCase().includes(query) ||
        invitation.invitedBy.name.toLowerCase().includes(query) ||
        invitation.invitedBy.email.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [invitations, search, status]);

  function revokeInvitation(invitation: InvitationRow) {
    if (invitation.status === "accepted") {
      toast.error("Accepted invitations cannot be revoked.");
      return;
    }

    setInvitations((current) =>
      current.map((row) =>
        row.id === invitation.id ? { ...row, status: "revoked" } : row
      )
    );
    toast.success("Invitation marked as revoked.");
  }

  const columns = useMemo<ColumnDef<InvitationRow>[]>(
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
              {row.original.email}
            </span>
            <span className="block truncate text-[12px] text-muted-foreground">
              {row.original.roleName}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        accessorKey: "invitedBy",
        header: "Invited By",
        cell: ({ row }) => (
          <div className="min-w-0">
            <span className="block truncate font-medium">
              {row.original.invitedBy.name}
            </span>
            <span className="block truncate text-[12px] text-muted-foreground">
              {row.original.invitedBy.email}
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
            className={cn("capitalize", statusClassName[row.original.status])}
          >
            {row.original.status}
          </Badge>
        ),
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
              row.original.status === "revoked"
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
      },
    ],
    []
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
        data={filteredInvitations}
        columns={columns}
        getRowId={(row) => row.id}
        emptyText="No invitations found"
        containerClassName="h-[calc(100vh-320px)] min-h-72"
      />
    </div>
  );
}

export { InvitationTable };
