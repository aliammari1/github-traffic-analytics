"use client";
import React, { useState, useMemo } from "react";
import { Octokit } from "octokit";
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

function RepoTrafficViewer() {
  const octokit = new Octokit({
    auth: `${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
  });

  type RepoData = {
    name: string;
    url: string;
    views: number;
    uniqueViews: number;
    clones: number;
    uniqueClones: number;
    yesterdayViews: number;
    yesterdayUniqueViews: number;
    yesterdayClones: number;
    yesterdayUniqueClones: number;
  };

  const [repos, setRepos] = useState<RepoData[]>([]);

  async function fetchRepos() {
    const { data } = await octokit.request("GET /user/repos", {
      _page: 100,
      visibility: "public",
      affiliation: "owner",
      sort: "updated",
      direction: "desc",
    });
    const reposWithTrafficData = await Promise.all(
      data.map(async (repo: any) => {
        const { data: views } = await octokit.request(
          `GET /repos/${repo.owner.login}/${repo.name}/traffic/views`
        );
        const { data: clones } = await octokit.request(
          `GET /repos/${repo.owner.login}/${repo.name}/traffic/clones`
        );
        const today = new Date().toISOString().slice(0, 10);
        const todayViews = views.views.find(
          (view: any) => view.timestamp.slice(0, 10) === today
        ) || { count: 0, uniques: 0 };
        const todayClones = clones.clones.find(
          (clone: any) => clone.timestamp.slice(0, 10) === today
        ) || { count: 0, uniques: 0 };

        return {
          name: repo.name,
          url: repo.html_url,
          views: views.count,
          uniqueViews: views.uniques,
          clones: clones.count,
          uniqueClones: clones.uniques,
          yesterdayViews: views.count - todayViews.count,
          yesterdayUniqueViews: views.uniques - todayViews.uniques,
          yesterdayClones: clones.count - todayClones.count,
          yesterdayUniqueClones: clones.uniques - todayClones.uniques,
        };
      })
    );
    setRepos(reposWithTrafficData);
  }

  fetchRepos();

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
              <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue(key)}</div>,
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
