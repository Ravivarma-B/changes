"use client";

import {
  ColumnDef,
  HeaderContext,
  RowSelectionState,
  SortingState,
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

import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

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
}

export default function TableView({
  data,
  columns,
  onSelectionChange,
  pagination,
}: TableViewProps) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);

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
                onClick={() => column.toggleSorting()}
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
    [columns]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      rowSelection,
      sorting,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: (newSelection) => {
      setRowSelection(newSelection);
      const selected = table
        .getSelectedRowModel()
        .rows.map((r) => r.original.id);
      onSelectionChange?.(selected);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const pageCount = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : table.getPageCount();
  const pageIndex = pagination?.page ?? table.getState().pagination.pageIndex;

  return (
    <div className="space-y-4 dark:bg-background">
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
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-2 py-3 text-sm text-muted-foreground border-t bg-gray-100 dark:bg-card">
        <div>
          {Object.keys(rowSelection).length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-1">
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={() => pagination?.onPageChange(pageIndex - 1)}
                  disabled={pageIndex === 0}
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
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationNext
                  onClick={() => pagination?.onPageChange(pageIndex + 1)}
                  disabled={pageIndex >= pageCount - 1}
                />
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
