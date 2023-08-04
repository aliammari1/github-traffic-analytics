import React, { useState, useEffect } from "react";
import { Octokit } from "octokit";

const octokit = new Octokit({
    auth: process.env.REACT_APP_GITHUB_TOKEN,
});

function RepoTrafficViewer() {
    const [repos, setRepos] = useState([]);

    async function fetchRepos() {
        const { data } = await octokit.request("GET /user/repos", {
            per_page: 100,
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
                const { data: todayViews } = await octokit.request(
                    `GET /repos/${repo.owner.login}/${repo.name}/traffic/views?per=day`
                );
                const { data: todayClones } = await octokit.request(
                    `GET /repos/${repo.owner.login}/${repo.name}/traffic/clones?per=day`
                );

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
                        {repos.map(({ name, url, views, uniqueViews, clones, uniqueClones, yesterdayViews, yesterdayUniqueViews, yesterdayClones, yesterdayUniqueClones, }) => {
                            return (
                                <tr key={name}>
                                    <td>{name}</td>
                                    <td>
                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                            {url}
                                        </a>
                                    </td>
                                    <td><per>{views} {yesterdayViews}</per></td>
                                    <td><per>{uniqueViews} {yesterdayUniqueViews}</per></td>
                                    <td><per>{clones} {yesterdayClones}</per></td>
                                    <td><per>{uniqueClones} {yesterdayUniqueClones}</per></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <style jsx>{`
                .table {
                    border-collapse: collapse;
                    width: 100%;
                }
                .table th,
                .table td {
                    padding: 8px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                .table th {
                    background-color: #0366d6;
                    color: #fff;
                }
                .table tr:hover {
                    background-color: #f5f5f5;
                }
                .table a {
                    color: #0366d6;
                }
                #repo-traffic {
                    background-color: #f2f2f2;
                    padding: 20px;
                    border-radius: 10px;
                }
                h2 {
                    color: #0366d6;
                    margin-bottom: 20px;
                }
            `}</style>
        </section>
    );
}

export default RepoTrafficViewer;
