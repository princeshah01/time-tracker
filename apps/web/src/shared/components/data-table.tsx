import { useEffect, useRef, useCallback } from "react";
import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { AppIcon } from "./app-icon";

type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  getRowId?: (row: TData, index: number) => string;

  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;

  emptyText?: string;

  estimatedRowHeight?: number;
  rowBuffer?: number;
  setRowLimit?: (limit: number) => void;

  onRowClick?: (row: TData) => void;
  onRowContextMenu?: (event: React.MouseEvent, row: TData) => void;
};

// 🔥 Skeleton Row
function SkeletonRow({ columns }: { columns: number }) {
  return (
    <TableRow>
      {Array.from({ length: columns }).map((_, i) => (
        <TableCell key={i} className="px-3 py-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable<TData>({
  data,
  columns,
  getRowId,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  emptyText = "No data found",

  estimatedRowHeight = 44,
  rowBuffer = 6,
  setRowLimit,

  onRowClick,
  onRowContextMenu,
}: DataTableProps<TData>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastLimitRef = useRef<number | null>(null);

  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
  });

  // 🔥 Dynamic row limit (virtual-like behavior)
  useEffect(() => {
    const el = containerRef.current;
    if (!setRowLimit || !el) return;

    const calculateLimit = () => {
      const height = el.clientHeight;

      const nextLimit = Math.ceil(height / estimatedRowHeight) + rowBuffer;

      if (lastLimitRef.current === nextLimit) return;

      lastLimitRef.current = nextLimit;
      setRowLimit(nextLimit);
    };

    calculateLimit();

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(calculateLimit);
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [setRowLimit, estimatedRowHeight, rowBuffer]);

  // 🔥 Infinite scroll (stable callback)
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;

      const isNearBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 40;

      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage?.();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const rows = table.getRowModel().rows;
  const showEmpty = !isLoading && rows.length === 0;

  return (
    <div className="rounded-md border overflow-clip">
      <div
        ref={containerRef}
        className="relative h-[calc(100vh-207px)] overflow-auto no-scrollbar mask-b-from-0% mask-b-to-170%"
        onScroll={handleScroll}
      >
        <Table className="w-full table-fixed">
          <TableHeader className="sticky top-0 z-50 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-3 text-[12px]">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} columns={columns.length} />
              ))}

            {!isLoading &&
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => onRowClick?.(row.original)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onRowContextMenu?.(e, row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {isFetchingNextPage && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-4 text-center text-muted-foreground"
                >
                  Loading more...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {showEmpty && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-muted-foreground text-sm">
            <AppIcon name="Inbox" className="mb-1 size-10" />
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}
