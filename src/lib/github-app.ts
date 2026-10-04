// SPDX-License-Identifier: MIT

export interface GitHubAppCredentials {
  appId: string;
  privateKey: string;
}

export interface InstallationRepository {
  id: number;
  full_name: string;
  private: boolean;
  owner: { login: string };
  name: string;
}

const API = "https://api.github.com";
const VERSION = "2026-03-10";

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function derLength(length: number): number[] {
  if (length < 128) return [length];
  const bytes: number[] = [];
  while (length > 0) {
    bytes.unshift(length & 0xff);
    length = Math.floor(length / 256);
  }
  return [0x80 | bytes.length, ...bytes];
}

function der(tag: number, contents: Uint8Array): Uint8Array<ArrayBuffer> {
  return Uint8Array.from([tag, ...derLength(contents.length), ...contents]);
}

function pemBytes(pem: string): Uint8Array<ArrayBuffer> {
  const normalized = pem.replace(/\\n/g, "\n");
  const pkcs1 = normalized.includes("-----BEGIN RSA PRIVATE KEY-----");
  const body = normalized
    .replace(/-----BEGIN (RSA )?PRIVATE KEY-----|-----END (RSA )?PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const raw = Uint8Array.from(atob(body), (character) => character.charCodeAt(0));
  if (!pkcs1) return raw;
  // GitHub commonly downloads PKCS#1 RSA PEM. WebCrypto imports PKCS#8, so
  // wrap the RSA structure with the standard rsaEncryption algorithm ID.
  const algorithm = Uint8Array.from([
    0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
  ]);
  return der(0x30, Uint8Array.from([0x02, 0x01, 0x00, ...algorithm, ...der(0x04, raw)]));
}

export async function appJwt(credentials: GitHubAppCredentials, now = Date.now()): Promise<string> {
  if (!/^\d+$/.test(credentials.appId)) throw new Error("Invalid GitHub App ID");
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemBytes(credentials.privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const header = base64Url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const payload = base64Url(
    new TextEncoder().encode(
      JSON.stringify({
        iat: Math.floor(now / 1000) - 60,
        exp: Math.floor(now / 1000) + 540,
        iss: credentials.appId,
      })
    )
  );
  const message = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(message)
  );
  return `${message}.${base64Url(new Uint8Array(signature))}`;
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "github-traffic-analytics-app",
    "X-GitHub-Api-Version": VERSION,
  };
}

async function githubJson<T>(
  fetcher: typeof fetch,
  url: string,
  token: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const response = await fetcher(url, {
    method: options.method ?? "GET",
    headers: headers(token),
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`GitHub App API returned ${response.status}`);
  return (await response.json()) as T;
}

export async function installationToken(
  credentials: GitHubAppCredentials,
  installationId: number,
  options: {
    repositoryIds?: number[];
    permissions?: Record<string, "read" | "write">;
  } = {},
  fetcher: typeof fetch = fetch
): Promise<string> {
  if (!Number.isSafeInteger(installationId) || installationId <= 0)
    throw new Error("Invalid installation ID");
  const result = await githubJson<{ token: string }>(
    fetcher,
    `${API}/app/installations/${installationId}/access_tokens`,
    await appJwt(credentials),
    {
      method: "POST",
      body: {
        ...(options.repositoryIds ? { repository_ids: options.repositoryIds } : {}),
        ...(options.permissions ? { permissions: options.permissions } : {}),
      },
    }
  );
  if (!result.token) throw new Error("GitHub App omitted an installation token");
  return result.token;
}

export async function installationInfo(
  credentials: GitHubAppCredentials,
  installationId: number,
  fetcher: typeof fetch = fetch
): Promise<{ id: number; account: { login: string; id: number }; suspended_at: string | null }> {
  return githubJson(
    fetcher,
    `${API}/app/installations/${installationId}`,
    await appJwt(credentials)
  );
}

export async function installationRepositories(
  token: string,
  fetcher: typeof fetch = fetch
): Promise<InstallationRepository[]> {
  const repositories: InstallationRepository[] = [];
  for (let page = 1; page <= 100; page++) {
    const result = await githubJson<{ repositories: InstallationRepository[] }>(
      fetcher,
      `${API}/installation/repositories?per_page=100&page=${page}`,
      token
    );
    repositories.push(...result.repositories);
    if (result.repositories.length < 100) break;
    if (page === 100)
      throw new Error("Installation selects more repositories than the supported page limit");
  }
  return repositories;
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature || !/^sha256=[0-9a-f]{64}$/.test(signature)) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expected = `sha256=${[...new Uint8Array(signed)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
  let difference = 0;
  for (let index = 0; index < expected.length; index++)
    difference |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  return difference === 0;
}
