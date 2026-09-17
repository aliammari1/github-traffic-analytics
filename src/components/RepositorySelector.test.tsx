// SPDX-License-Identifier: MIT
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RepositorySelector from "./RepositorySelector";
import { server, http, HttpResponse, sampleRepos } from "@/test/msw";

// next/image renders a plain <img> in jsdom; stub it to avoid loader config.
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as Record<string, never>)} />;
  },
}));

describe("RepositorySelector", () => {
  it("loads and lists repositories, with a Traffic Available badge", async () => {
    server.use(http.get("/api/repositories", () => HttpResponse.json(sampleRepos)));

    render(<RepositorySelector onRepositorySelect={() => {}} />);

    expect(await screen.findByText("repo-one")).toBeInTheDocument();
    expect(screen.getByText("Traffic Available")).toBeInTheDocument();
    expect(screen.getByText("First repo")).toBeInTheDocument();
  });

  it("calls onRepositorySelect when a repo is clicked", async () => {
    server.use(http.get("/api/repositories", () => HttpResponse.json(sampleRepos)));
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(<RepositorySelector onRepositorySelect={onSelect} />);
    await user.click(await screen.findByText("repo-one"));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: "repo-one" }));
  });

  it("renders an error state when the request fails", async () => {
    server.use(http.get("/api/repositories", () => new HttpResponse(null, { status: 500 })));

    render(<RepositorySelector onRepositorySelect={() => {}} />);

    await waitFor(() =>
      expect(screen.getByText(/Failed to fetch repositories/)).toBeInTheDocument()
    );
  });
});
