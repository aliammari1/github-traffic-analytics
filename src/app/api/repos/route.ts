import { RepoData } from "@/constants/RepoData";
import OctokitClient from "../OctokitClient";

export async function GET() {
  const octokit = OctokitClient.getInstance();
  const data = await octokit
    .request("GET /user/repos", {
      _page: 100,
      visibility: "public",
      affiliation: "owner",
      sort: "updated",
      direction: "desc",
    })
    .then((response) => {
      return Promise.all(
        response.data.map(async (repo) => {
          const views = (
            await octokit.request(
              `GET /repos/${repo.owner.login}/${repo.name}/traffic/views`
            )
          )?.data;
          const clones = (
            await octokit.request(
              `GET /repos/${repo.owner.login}/${repo.name}/traffic/clones`
            )
          )?.data;
          return {
            name: repo.name,
            url: repo.html_url,
            views: views.count,
            uniqueViews: views.uniques,
            clones: clones.count,
            uniqueClones: clones.uniques,
            yesterdayViews: views.views[views.views.length - 1]?.count || 0,
            yesterdayUniqueViews:
              views.views[views.views.length - 1]?.uniques || 0,
            yesterdayClones:
              clones.clones[clones.clones.length - 1]?.count || 0,
            yesterdayUniqueClones:
              clones.clones[clones.clones.length - 1]?.uniques || 0,
          } as RepoData;
        })
      );
    });
  return Response.json(data);
}
