import { useMemo } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/shared/components/data-table";
import { formatTableDate } from "@/shared/lib";
import type {
  ClientListItem,
  ClientMenuState,
  ListClientsResponse,
} from "../client.types";
import {
  ClientIdentityCell,
  ClientStatusAction,
  ClientStatusBadge,
} from "./client-table-cells";

type ClientTableProps = {
  data?: InfiniteData<ListClientsResponse>;
  isLoading: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  setRowLimit: (limit: number) => void;
  canManage: boolean;
  onOpen: (client: ClientListItem) => void;
  onToggleStatus: (client: ClientListItem) => void;
  setMenuState: (state: ClientMenuState) => void;
};

function ClientTable({
  data,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  setRowLimit,
  canManage,
  onOpen,
  onToggleStatus,
  setMenuState,
}: ClientTableProps) {
  const clients = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const columns = useMemo<ColumnDef<ClientListItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Client Name",
        cell: ({ row }) => <ClientIdentityCell client={row.original} />,
        size: 250,
      },
      {
        accessorKey: "company",
        header: "Company Name",
        cell: ({ row }) => (
          <span
            className="block truncate text-[13px]"
            title={row.original.company ?? "-"}
          >
            {row.original.company ?? "-"}
          </span>
        ),
        size: 210,
      },
      {
        accessorKey: "projectTotal",
        header: "Projects",
        cell: ({ row }) => row.original.projectTotal ?? 0,
        size: 90,
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <ClientStatusBadge isActive={row.original.isActive} />
        ),
        size: 105,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatTableDate(row.original.createdAt),
        size: 120,
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <ClientStatusAction
            client={row.original}
            canManage={canManage}
            onToggleStatus={onToggleStatus}
          />
        ),
        size: 70,
      },
    ],
    [canManage, onToggleStatus]
  );

  return (
    <DataTable
      data={clients}
      columns={columns}
      getRowId={(row) => String(row.id)}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      setRowLimit={setRowLimit}
      onRowClick={(client) => {
        setMenuState(null);
        onOpen(client);
      }}
      onRowContextMenu={(event, client) => {
        setMenuState({
          x: event.clientX,
          y: event.clientY,
          row: client,
        });
      }}
      containerClassName="h-[calc(100vh-125px)]"
      emptyText="No clients found"
    />
  );
}

export { ClientTable };
