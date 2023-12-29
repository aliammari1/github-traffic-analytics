import React, { useState, useEffect } from "react";
import { Octokit } from "octokit";
import "./index.css";

const octokit = new Octokit({
  auth: process.env.REACT_APP_GITHUB_TOKEN,
});

function RepoTrafficViewer() {
  const [repos, setRepos] = useState([]);

  async function fetchRepos() {
    const { data } = await octokit.request("GET /user/repos", {
      _page: 100,
      visibility: "public",
      affiliation: "owner",
      sort: "updated",
      direction: "desc",
    });
    const reposWithTrafficData = await Promise.all(
      data.map(async (repo) => {
        const { data: views } = await octokit.request(
          `GET /repos/${repo.owner.login}/${repo.name}/traffic/views`
        );
        const { data: clones } = await octokit.request(
          `GET /repos/${repo.owner.login}/${repo.name}/traffic/clones`
        );
        const today = new Date().toISOString().slice(0, 10);
        const todayViews = views.views.find(
          (view) => view.timestamp.slice(0, 10) === today
        ) || { count: 0, uniques: 0 };
        const todayClones = clones.clones.find(
          (clone) => clone.timestamp.slice(0, 10) === today
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
    fetchRepos();
    const intervalId = setInterval(fetchRepos, 300000); // call fetchRepos every 5 minutes
    return () => clearInterval(intervalId); // cleanup function to clear the interval
  }, []);

  return (
    <section id="repo-traffic">
      <h2 className="text-2xl font-bold mb-4">Repo Traffic Viewer</h2>
      <div className="bg-gray-200 p-4 rounded-lg shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="py-2 px-4 bg-gray-300">Name</th>
                <th className="py-2 px-4 bg-gray-300">URL</th>
                <th className="py-2 px-4 bg-gray-300">Views</th>
                <th className="py-2 px-4 bg-gray-300">Unique Views</th>
                <th className="py-2 px-4 bg-gray-300">Clones</th>
                <th className="py-2 px-4 bg-gray-300">Unique Clones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
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
                    <tr key={name} className="border-b border-gray-300">
                      <td className="py-2 px-4">{name}</td>
                      <td className="py-2 px-4">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {url}
                        </a>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex justify-between">
                          <strong className="text-gray-800">{views}</strong>
                          <strong className="text-gray-500">{yesterdayViews}</strong>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex justify-between">
                          <strong className="text-gray-800">{uniqueViews}</strong>
                          <strong className="text-gray-500">{yesterdayUniqueViews}</strong>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex justify-between">
                          <strong className="text-gray-800">{clones}</strong>
                          <strong className="text-gray-500">{yesterdayClones}</strong>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex justify-between">
                          <strong className="text-gray-800">{uniqueClones}</strong>
                          <strong className="text-gray-500">{yesterdayUniqueClones}</strong>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default RepoTrafficViewer;
