// SPDX-License-Identifier: MIT
import { describe, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createServer } from "node:http";
import { resolve } from "node:path";

const execFileAsync = promisify(execFile);
const cliPath = resolve(__dirname, "../../integrations/gh-traffic/gh-traffic");

describe("gh-traffic CLI", () => {
  it("displays help including --json flag", async () => {
    const { stdout } = await execFileAsync("node", [cliPath, "help"]);
    expect(stdout).toContain("gh traffic — repository growth and owner traffic");
    expect(stdout).toContain("--json");
    expect(stdout).toContain("gh traffic view OWNER/REPO [--json]");
    expect(stdout).toContain("gh traffic compare OWNER/REPO OTHER/REPO [MORE/REPO ...] [--json]");
  });

  it("validates repository format on invalid inputs", async () => {
    try {
      await execFileAsync("node", [cliPath, "view", "invalid-repo"]);
      expect.fail("Should have thrown");
    } catch (err: unknown) {
      const error = err as { code: number; stderr: string };
      expect(error.code).toBe(1);
      expect(error.stderr).toContain("Use OWNER/REPO for each repository");
    }
  });

  it("validates comparison repository count", async () => {
    try {
      await execFileAsync("node", [cliPath, "compare", "cli/cli"]);
      expect.fail("Should have thrown");
    } catch (err: unknown) {
      const error = err as { code: number; stderr: string };
      expect(error.code).toBe(1);
      expect(error.stderr).toContain("Compare two to four repositories");
    }
  });

  it("outputs unadorned JSON when --json is provided against API base", async () => {
    const mockData = {
      version: 1,
      repository: {
        fullName: "cli/cli",
        stars: 35000,
        url: "https://github.com/cli/cli",
      },
      growth: {
        stars7d: 42,
        stars30d: 180,
        momentum: { score: 78 },
      },
    };

    const server = createServer((req, res) => {
      if (req.url === "/repositories/cli/cli") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(mockData));
        return;
      }
      res.writeHead(404);
      res.end();
    });

    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;

    try {
      const { stdout, stderr } = await execFileAsync(
        "node",
        [cliPath, "view", "cli/cli", "--json"],
        {
          env: {
            ...process.env,
            GTA_API_BASE: `http://127.0.0.1:${port}`,
          },
        }
      );

      expect(stderr).toBe("");
      const parsed = JSON.parse(stdout);
      expect(parsed).toEqual(mockData);
      expect(parsed.repository.fullName).toBe("cli/cli");
      expect(parsed.growth.momentum.score).toBe(78);
    } finally {
      await new Promise<void>((done) => server.close(() => done()));
    }
  });
});
