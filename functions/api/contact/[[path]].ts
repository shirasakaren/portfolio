/**
 * Contact form handler for Cloudflare Pages Functions.
 *
 *   POST /api/contact  — Multipart form data. The function uploads any
 *                         attached file to R2, then forwards the message as
 *                         an email via Cloudflare Email Routing.
 *
 * ## Bindings expected on the Pages project
 *
 *   R2 bucket   `ATTACHMENTS`    → ren-contact-attachments
 *   Secret      `CONTACT_TO`     → ren@shirasaka.work
 *   Secret      `CONTACT_FROM`   → noreply@shirasaka.work
 *   Email       `SEND_EMAIL`     → the Email Routing send_email binding
 */

import { EmailMessage } from "cloudflare:email";

// ── types ───────────────────────────────────────────────────────────────

interface SendEmailBinding {
  send(message: EmailMessage): Promise<void>;
}

interface Env {
  ATTACHMENTS?: R2Bucket;
  SEND_EMAIL?: SendEmailBinding;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

const MAX_NAME = 200;
const MAX_MESSAGE = 6000;
const MAX_FILE = 25 * 1024 * 1024; // 25 MB
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ── routing ─────────────────────────────────────────────────────────────

export const onRequest = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  if (request.method === "OPTIONS") return cors();

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: "POST" },
    });
  }

  return handleContact(request, env);
};

// ── CORS ────────────────────────────────────────────────────────────────

function cors(body?: BodyInit | null, status = 200): Response {
  const headers = new Headers({
    "access-control-allow-origin": "https://ren.shirasaka.work",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
  });
  if (body && typeof body === "object" && !(body instanceof ReadableStream)) {
    headers.set("content-type", "application/json; charset=utf-8");
  }
  return new Response(body, { status, headers });
}

function jsonE(data: unknown, status = 200): Response {
  return cors(JSON.stringify(data), status);
}

function errResp(message: string, status = 400): Response {
  return cors(JSON.stringify({ error: message }), status);
}

// ── contact ─────────────────────────────────────────────────────────────

async function handleContact(request: Request, env: Env): Promise<Response> {
  // The front end posts multipart/form-data so the browser can send a file
  // natively. `formData()` buffers the full request body in isolate memory;
  // the 25 MB cap on the client keeps this far from the 128 MB ceiling.
  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return errResp("Expected form data.");
  }

  const name = (fd.get("name") as string | null)?.trim() ?? "";
  const email = (fd.get("email") as string | null)?.trim() ?? "";
  const message = (fd.get("message") as string | null)?.trim() ?? "";
  const file = fd.get("attachment") as File | null;

  if (!name || name.length > MAX_NAME)
    return errResp("Please include your name.");
  if (!EMAIL_RE.test(email) || email.length > MAX_NAME)
    return errResp("That email address doesn't look right.");
  if (!message || message.length > MAX_MESSAGE)
    return errResp(`Message must be 1–${MAX_MESSAGE} characters.`);

  if (file && file.size > MAX_FILE)
    return errResp(`File too large (${MAX_FILE / 1024 / 1024} MB max).`, 413);

  // ── upload file to R2 ──

  let attachmentLine = "";
  if (file && file.size > 0 && env.ATTACHMENTS) {
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
      const key = `incoming/${Date.now()}-${safe}`;

      await env.ATTACHMENTS.put(key, file.stream(), {
        customMetadata: {
          originalName: file.name.slice(0, 512),
          uploadedAt: new Date().toISOString(),
        },
        httpMetadata: {
          contentType: file.type || "application/octet-stream",
        },
      });

      attachmentLine =
        `${file.name}  ·  ${formatBytes(file.size)}\n` +
        `Stored: ${key}`;
    } catch (e) {
      console.error("[contact] R2 upload failed", e);
      // Don't fail the whole submission — the message still goes through.
      attachmentLine = `${file.name}  — upload failed, but the message is below`;
    }
  }

  // ── send email ──

  const to = env.CONTACT_TO;
  const from = env.CONTACT_FROM;
  if (!env.SEND_EMAIL || !to || !from) {
    return errResp(
      "Mail delivery isn't configured yet. Please email ren@shirasaka.work directly.",
      503,
    );
  }

  const country = request.headers.get("cf-ipcountry") ?? "unknown";
  const emailBody = [
    `From:    ${name} <${email}>`,
    `Country: ${country}`,
    `Sent:    ${new Date().toISOString()}`,
    "",
    "─".repeat(48),
    "",
    message,
    "",
    attachmentLine ? `📎 Attachment\n${attachmentLine}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const raw = buildMime({
      from,
      to,
      replyTo: headerSafe(email),
      fromName: `${headerSafe(name)} (via shirasaka.work)`,
      subject: `Portfolio — ${headerSafe(name)}`,
      body: emailBody,
    });

    await env.SEND_EMAIL.send(new EmailMessage(from, to, raw));
    return jsonE({ ok: true });
  } catch (e) {
    console.error("[contact] send failed", e);
    return errResp(
      "Couldn't deliver that. Please email ren@shirasaka.work directly.",
      502,
    );
  }
}

// ── MIME construction (RFC 5322 + RFC 2047) ────────────────────────────

function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function encodeHeaderWord(value: string): string {
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return `=?UTF-8?B?${btoa(binary)}?=`;
}

function base64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function wrap76(value: string): string {
  return (value.match(/.{1,76}/g) ?? []).join("\r\n");
}

function buildMime(opts: {
  from: string;
  to: string;
  replyTo: string;
  fromName: string;
  subject: string;
  body: string;
}): string {
  const headers = [
    `From: ${encodeHeaderWord(opts.fromName)} <${opts.from}>`,
    `To: <${opts.to}>`,
    `Reply-To: <${opts.replyTo}>`,
    `Subject: ${encodeHeaderWord(opts.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@shirasaka.work>`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="utf-8"',
    "Content-Transfer-Encoding: base64",
  ];
  return `${headers.join("\r\n")}\r\n\r\n${wrap76(base64Utf8(opts.body))}\r\n`;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
