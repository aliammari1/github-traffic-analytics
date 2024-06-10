"use client"
import React, { useState, useEffect } from "react";
import { Octokit } from "@octokit/rest";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import '../globals.css'
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
const octokit = new Octokit();

function RepoTrafficViewer() {
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
  const [token, setToken] = useState("");
  const [acceptedToken, setAcceptedToken] = useState("");

  async function fetchRepos() {
    const { data } = await octokit.request("GET /user/repos", {
      _page: 100,
      visibility: "public",
      affiliation: "owner",
      sort: "updated",
      direction: "desc",
      headers: {
        authorization: `token ${acceptedToken}`,
      },
    });

    const reposWithTrafficData = await Promise.all(
      data.map(async (repo) => {
        const { data: views } = await octokit.request(
          `GET /repos/${repo.owner.login}/${repo.name}/traffic/views`,
          {
            headers: {
              authorization: `token ${acceptedToken}`,
            },
          }
        );
        const { data: clones } = await octokit.request(
          `GET /repos/${repo.owner.login}/${repo.name}/traffic/clones`,
          {
            headers: {
              authorization: `token ${acceptedToken}`,
            },
          }
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

  useEffect(() => {
    if (token !== "") fetchRepos();
    const intervalId = setInterval(fetchRepos, 300000); // call fetchRepos every 5 minutes
    return () => clearInterval(intervalId); // cleanup function to clear the interval
  }, [acceptedToken]);

  const handleAcceptToken = () => {
    setAcceptedToken(process.env.GITHUB_TOKEN || token);
  };

  return (
    <section id="repo-traffic">
      <h2 className="text-2xl font-bold">Repo Traffic Viewer</h2>
      <div className="mt-4">
        <div className="flex items-center">
          <Label htmlFor="token" className="mr-2">GitHub API Token:</Label>
          <Input
            type="text"
            id="token"
            value={process.env.GITHUB_TOKEN}
            onChange={(e) => setToken(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          />
          <Button
            onClick={handleAcceptToken}
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Accept Token
          </Button>
        </div>
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Unique Views</TableHead>
              <TableHead>Clones</TableHead>
              <TableHead>Unique Clones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repos.map(
              ({
                name,
                url,
                views,
                uniqueViews,
                clones,
                uniqueClones,
                yesterdayViews,
                yesterdayUniqueViews,
                yesterdayClones,
                yesterdayUniqueClones,
              }) => {
                return (
                  <TableRow key={name}>
                    <TableCell>{name}</TableCell>
                    <TableCell>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500"
                      >
                        {url}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div>
                        <strong>{views}</strong>
                        <strong>{yesterdayViews}</strong>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <strong>{uniqueViews}</strong>
                        <strong>{yesterdayUniqueViews}</strong>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <strong>{clones}</strong>
                        <strong>{yesterdayClones}</strong>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <strong>{uniqueClones}</strong>
                        <strong>{yesterdayUniqueClones}</strong>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export default RepoTrafficViewer;
