/**
 * POST /api/contact — the only server-side code on this site.
 *
 * Runs as a Cloudflare Pages Function and hands the message to Cloudflare Email
 * Routing via a `send_email` binding, so there is no third-party mail provider
 * and no API key to leak.
 *
 * Setup (once):
 *   1. Enable Email Routing on the zone and verify the destination address.
 *   2. Bind it to this Pages project — Settings → Functions → Email bindings —
 *      with the variable name `SEND_EMAIL`.
 *   3. Set the plain vars `CONTACT_TO` (the verified destination) and
 *      `CONTACT_FROM` (any address on the zone, e.g. noreply@shirasaka.work).
 *
 * Until that's configured the endpoint answers 503 with a clear message rather
 * than pretending to have sent anything.
 */

import { EmailMessage } from "cloudflare:email";

interface SendEmailBinding {
  send(message: EmailMessage): Promise<void>;
}

type Env = {
  SEND_EMAIL?: SendEmailBinding;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
};

type Payload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

const MAX_NAME = 200;
const MAX_MESSAGE = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

/** Anything destined for a header must not be able to inject one. */
function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/** RFC 2047 encoded-word, so non-ASCII names and subjects survive intact. */
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

/** Base64 bodies must be wrapped at 76 characters (RFC 2045). */
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

async function handlePost(request: Request, env: Env): Promise<Response> {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return json({ error: "Expected a JSON body." }, 400);
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const message =
    typeof payload.message === "string" ? payload.message.trim() : "";

  if (!name || name.length > MAX_NAME) {
    return json({ error: "Please include your name." }, 400);
  }
  if (!EMAIL_RE.test(email) || email.length > MAX_NAME) {
    return json({ error: "That email address doesn't look right." }, 400);
  }
  if (!message || message.length > MAX_MESSAGE) {
    return json(
      { error: `Message must be 1–${MAX_MESSAGE} characters.` },
      400,
    );
  }

  const to = env.CONTACT_TO;
  const from = env.CONTACT_FROM;
  if (!env.SEND_EMAIL || !to || !from) {
    return json(
      {
        error:
          "Mail delivery isn't configured yet. Please email ren@shirasaka.work directly.",
      },
      503,
    );
  }

  const country = request.headers.get("cf-ipcountry") ?? "unknown";
  const body = [
    `From:    ${name} <${email}>`,
    `Country: ${country}`,
    `Sent:    ${new Date().toISOString()}`,
    "",
    "─".repeat(48),
    "",
    message,
    "",
  ].join("\n");

  const raw = buildMime({
    from,
    to,
    replyTo: headerSafe(email),
    fromName: `${headerSafe(name)} (via shirasaka.work)`,
    subject: `Portfolio contact — ${headerSafe(name)}`,
    body,
  });

  try {
    await env.SEND_EMAIL.send(new EmailMessage(from, to, raw));
  } catch (err) {
    console.error("[contact] send failed", err);
    return json(
      {
        error:
          "Couldn't deliver that. Please email ren@shirasaka.work directly.",
      },
      502,
    );
  }

  return json({ ok: true }, 200);
}

export const onRequest = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: "POST" },
    });
  }
  return handlePost(context.request, context.env);
};
