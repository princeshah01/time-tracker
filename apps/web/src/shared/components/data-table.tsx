import { useEffect, useRef } from "react";
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

type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  getRowId?: (row: TData) => string;

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

  useEffect(() => {
    if (!setRowLimit || !containerRef.current) return;

    const calculateLimit = () => {
      const height = containerRef.current!.clientHeight;
      const nextLimit =
        Math.ceil(height / estimatedRowHeight) + rowBuffer;

      if (lastLimitRef.current === nextLimit) return;

      lastLimitRef.current = nextLimit;
      setRowLimit(nextLimit);
    };

    calculateLimit();

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(calculateLimit);
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [setRowLimit, estimatedRowHeight, rowBuffer]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;

    if (
      el.scrollTop + el.clientHeight >= el.scrollHeight - 40 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage?.();
    }
  }

  return (
    <div className="rounded-md border overflow-hidden">
      {/* 🔥 HEADER (fixed) */}
      <Table>
        <TableHeader className="bg-background">
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
      </Table>

      {/* 🔥 BODY (scrollable) */}
      <div
        ref={containerRef}
        className="h-[calc(100vh-260px)] overflow-auto"
        onScroll={handleScroll}
      >
        <Table>
          <TableBody className="bg-red-500 w-full h-full">
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground  w-full h-full">
                {/* <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-muted-foreground"
                >
                  {emptyText}
                </TableCell> */}
              </div>
            ) : (
              table.getRowModel().rows.map((row) => (
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
                    <TableCell
                      key={cell.id}
                      className="px-3 py-2 text-sm"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}

            {isFetchingNextPage && (
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
      </div>
    </div>
  );
}