"use client";

import {
  ColumnDef,
  HeaderContext,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";

import { Button } from "web-utils-components/button";
import { Checkbox } from "web-utils-components/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "web-utils-components/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "web-utils-components/table";

import { ArrowUpDown, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Sorting } from "./interface/Sorting";

export type RowData = {
  id: string | number;
  [key: string]: unknown;
};

type Column = {
  name: string;
  title: string;
  sortable?: boolean;
  className?: string;
  visible?: boolean;
};

interface TableViewProps {
  data: RowData[];
  columns: Column[];
  onSelectionChange?: (ids: RowData["id"][]) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (newPage: number) => void;
  };
  sorting: Sorting;
  onSortingChange: (sorting: Sorting) => void;
  initialSelection?: string[];
  isLoading?: boolean;
}

export default function TableViewWithServerSorting({
  data,
  columns,
  onSelectionChange,
  pagination,
  sorting: initialSorting,
  onSortingChange,
  initialSelection = [],
  isLoading = false,
}: TableViewProps) {
  const rowSelection = initialSelection.reduce(
    (acc, id) => ({ ...acc, [String(id)]: true }),
    {}
  );
  const [sorting, setSorting] = React.useState<Sorting>(initialSorting);

  React.useEffect(() => {
    setSorting(initialSorting);
  }, [initialSorting]);

  const handleSortingChange = (newSorting: Sorting) => {
    setSorting(newSorting);
    onSortingChange(newSorting);
  };

  const tableColumns = React.useMemo<ColumnDef<RowData>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div
            style={{ width: "40px", display: "flex", justifyContent: "center" }}
          >
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
            />
          </div>
        ),
        cell: ({ row }) => (
          <div
            style={{ width: "40px", display: "flex", justifyContent: "center" }}
          >
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
          </div>
        ),
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
      },
      ...columns
        .filter((col) => col.visible !== false)
        .map<ColumnDef<RowData>>((col) => ({
          accessorKey: col.name,
          header: (ctx: HeaderContext<RowData, unknown>) => {
            const { column } = ctx;
            const isSorted = column.getIsSorted();
            return col.sortable === false ? (
              col.title
            ) : (
              <Button
                variant="ghost"
                className="flex items-center gap-1 p-0 text-slate-500 dark:text-muted-foreground"
                onClick={() => {
                  const isCurrentColumn = sorting.sortKey === col.name;
                  const newSortDirection =
                    isCurrentColumn && sorting.sortDirection === "desc"
                      ? "asc"
                      : "desc";
                  handleSortingChange({
                    sortKey: col.name,
                    sortDirection: newSortDirection,
                  });
                }}
              >
                {col.title}
                {isSorted === "asc" ? (
                  <ChevronUp className="w-4 h-4" />
                ) : isSorted === "desc" ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ArrowUpDown className="w-4 h-4 opacity-40" />
                )}
              </Button>
            );
          },
          cell: (ctx) => {
            const value = ctx.getValue();
            return typeof value === "object" && React.isValidElement(value) ? (
              value
            ) : (
              <span>{String(value ?? "")}</span>
            );
          },
          enableSorting: col.sortable !== false,
          meta: {
            className: col.className,
          },
        })),
    ],
    [columns, sorting]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      rowSelection,
      sorting: [
        {
          id: sorting.sortKey,
          desc: sorting.sortDirection === "desc",
        },
      ],
    },
    onRowSelectionChange: (updater) => {
      if (!onSelectionChange) return;

      const newRowSelection =
        updater instanceof Function ? updater(rowSelection) : updater;
      const selectedIds = Object.keys(newRowSelection).filter(
        (key) => newRowSelection[key]
      );
      onSelectionChange(selectedIds);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    manualSorting: true,
    getRowId: (row) => String(row.id),
  });

  const pageCount = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : table.getPageCount();
  const pageIndex = pagination?.page ?? table.getState().pagination.pageIndex;

  return (
    <div className="space-y-4 dark:bg-background relative">
      {/* Loader overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-black/50 flex items-center justify-center z-10">
          <Loader2 className="animate-spin w-8 h-8 text-gray-600 dark:text-gray-300" />
        </div>
      )}

      <Table className="table-auto w-full">
        <TableHeader className="bg-[#f1f5f980] dark:bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}

          {/* Show "No data" row when empty */}
          {data.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-2 py-3 text-sm text-muted-foreground border-t bg-gray-100 dark:bg-card">
        <div>{Object.keys(rowSelection).length} row(s) selected</div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-1">
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={() => pagination?.onPageChange(pageIndex - 1)}
                  disabled={pageIndex === 0 || isLoading}
                />

                {Array.from({ length: pageCount }).map((_, i) => {
                  const isActive = i === pageIndex;
                  const isNear = Math.abs(i - pageIndex) <= 1;
                  const isEdge = i === 0 || i === pageCount - 1;

                  if (!isEdge && !isNear) {
                    if (i === pageIndex - 2 || i === pageIndex + 2) {
                      return (
                        <PaginationItem key={`ellipsis-${i}`} aria-hidden>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  }

                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={isActive}
                        onClick={() => pagination?.onPageChange(i)}
                        disabled={isLoading}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationNext
                  onClick={() => pagination?.onPageChange(pageIndex + 1)}
                  disabled={pageIndex >= pageCount - 1 || isLoading}
                />
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
