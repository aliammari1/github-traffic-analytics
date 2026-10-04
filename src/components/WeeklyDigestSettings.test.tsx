// SPDX-License-Identifier: MIT
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WeeklyDigestSettings from "./WeeklyDigestSettings";

describe("WeeklyDigestSettings", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("enables and disables email through explicit owner actions", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          available: true,
          enabled: false,
          recipientEmail: null,
          timeZone: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          available: true,
          enabled: true,
          recipientEmail: "alice@example.com",
          timeZone: "UTC",
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ available: true, enabled: false }) });
    vi.stubGlobal("fetch", fetcher);
    render(<WeeklyDigestSettings owner="alice" repo="project" />);
    const button = await screen.findByRole("button", { name: "Enable weekly email" });
    await userEvent.clear(screen.getByRole("textbox", { name: "Your timezone" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Your timezone" }), "UTC");
    await userEvent.click(button);
    expect(await screen.findByText("alice@example.com")).toBeInTheDocument();
    expect(fetcher.mock.calls[1][1]).toMatchObject({ method: "PUT", body: '{"timeZone":"UTC"}' });
    await userEvent.click(screen.getByRole("button", { name: "Turn off" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Weekly email disabled.");
    expect(fetcher.mock.calls[2][1]).toMatchObject({ method: "DELETE" });
  });

  it("shows a useful error when configuration cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "D1 unavailable." }) })
    );
    render(<WeeklyDigestSettings owner="alice" repo="project" />);
    expect(await screen.findByRole("status")).toHaveTextContent("D1 unavailable.");
  });

  it("does not offer opt-in on an unconfigured deployment", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          available: false,
          enabled: false,
          recipientEmail: null,
          timeZone: null,
        }),
      })
    );
    render(<WeeklyDigestSettings owner="alice" repo="project" />);
    expect(await screen.findByText(/awaiting delivery setup/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enable weekly email" })).toBeDisabled();
  });
});
