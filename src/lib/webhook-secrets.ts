// SPDX-License-Identifier: MIT

export type WebhookPlatform = "discord" | "slack";

export function validateWebhookUrl(value: string, platform: WebhookPlatform): boolean {
  if (value.length > 2_048) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.hash || url.search)
      return false;
    if (url.port) return false;
    if (platform === "slack")
      return (
        url.hostname === "hooks.slack.com" && /^\/services\/[^/]+\/[^/]+\/[^/]+$/.test(url.pathname)
      );
    return (
      (url.hostname === "discord.com" || url.hostname === "discordapp.com") &&
      /^\/api\/webhooks\/\d+\/[^/]+$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function encryptionKey(secret: string): Promise<CryptoKey> {
  const raw = base64ToBytes(secret);
  if (raw.byteLength !== 32) throw new Error("Webhook encryption key must be 32 bytes");
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

/** Associated data binds a ciphertext to its repository and destination. */
export async function encryptWebhookUrl(
  url: string,
  secret: string,
  context: string
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: new TextEncoder().encode(context) },
    await encryptionKey(secret),
    new TextEncoder().encode(url)
  );
  return `v1:${bytesToBase64(iv)}:${bytesToBase64(new Uint8Array(ciphertext))}`;
}

export async function decryptWebhookUrl(
  encrypted: string,
  secret: string,
  context: string
): Promise<string> {
  const [version, iv, ciphertext] = encrypted.split(":");
  if (version !== "v1" || !iv || !ciphertext) throw new Error("Invalid webhook ciphertext");
  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64ToBytes(iv),
      additionalData: new TextEncoder().encode(context),
    },
    await encryptionKey(secret),
    base64ToBytes(ciphertext)
  );
  return new TextDecoder().decode(plaintext);
}

export function webhookContext(
  ownerLogin: string,
  repoOwner: string,
  repoName: string,
  platform: WebhookPlatform
): string {
  return [ownerLogin, repoOwner, repoName, platform].join("\0");
}
