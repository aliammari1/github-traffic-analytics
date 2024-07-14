"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import "../globals.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CaretSortIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { RepoData } from "@/constants/RepoData";
import Link from "next/link";

function RepoTrafficViewer() {
  const [repos, setRepos] = useState<RepoData[]>([]);
  const fetchRepos = async () => {
    const data = (await axios.get("/api/repos")).data;
    setRepos(data);
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const data = repos;
  const columns: ColumnDef<RepoData>[] = useMemo(() => {
    const columnKeys = [
      "name",
      "views",
      "uniqueViews",
      "clones",
      "uniqueClones",
      "yesterdayViews",
      "yesterdayUniqueViews",
      "yesterdayClones",
      "yesterdayUniqueClones",
    ];

    return columnKeys.map((key) => {
      return {
        accessorKey: key,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
              <CaretSortIcon className="ml-2 size-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div>
            {row.index === 0 ? (
              <Link href={row.original.url} target="_blank">
                {row.getValue(key)}
              </Link>
            ) : (
              row.getValue(key)
            )}
          </div>
        ),
      };
    });
  }, []);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  return (
    <section id="repo-traffic">
      <div className="mt-4">
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter names..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-center">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

export default RepoTrafficViewer;
