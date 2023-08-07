import React, { useState, useEffect } from "react";
import { Octokit } from "octokit";
import "./RepoTrafficViewer.css";

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
      <h2>Repo Traffic Viewer</h2>
      <div className="container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>URL</th>
              <th>Views</th>
              <th>Unique Views</th>
              <th>Clones</th>
              <th>Unique Clones</th>
            </tr>
          </thead>
          <tbody>
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
                  <tr key={name}>
                    <td>{name}</td>
                    <td>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {url}
                      </a>
                    </td>
                    <td className="dataItem">
                      <strong className="today">{views}</strong>
                      <strong className="yesterday">{yesterdayViews}</strong>
                    </td>
                    <td className="dataItem">
                      <strong className="today">{uniqueViews}</strong>
                      <strong className="yesterday">{yesterdayUniqueViews}</strong>
                    </td>
                    <td className="dataItem">
                      <strong className="today">{clones}</strong>
                      <strong className="yesterday">{yesterdayClones}</strong>
                    </td>
                    <td className="dataItem">
                      <strong className="today">{uniqueClones}</strong>
                      <strong className="yesterday">{yesterdayUniqueClones}</strong>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default RepoTrafficViewer;
