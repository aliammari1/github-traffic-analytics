// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getTokenMock = vi.fn();
vi.mock("next-auth/jwt", () => ({
  getToken: (...args: unknown[]) => getTokenMock(...args),
}));

import { getServerAuth } from "./server-auth";

function request() {
  return new NextRequest(new Request("http://x/api/test"));
}

describe("getServerAuth", () => {
  beforeEach(() => {
    getTokenMock.mockReset();
  });

  it("returns the server-only access token and stable subject id", async () => {
    getTokenMock.mockResolvedValue({ accessToken: "gho_secret", sub: "100803794" });

    await expect(getServerAuth(request())).resolves.toEqual({
      accessToken: "gho_secret",
      userId: "100803794",
    });
  });

  it("returns null when either credential component is missing", async () => {
    getTokenMock.mockResolvedValue({ sub: "100803794" });
    await expect(getServerAuth(request())).resolves.toBeNull();
  });

  it("treats token parsing failures as unauthenticated", async () => {
    getTokenMock.mockRejectedValue(new Error("malformed token"));
    await expect(getServerAuth(request())).resolves.toBeNull();
  });
});
