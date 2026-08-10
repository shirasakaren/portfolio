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

// ── types ───────────────────────────────────────────────────────────────

interface Env {
  ATTACHMENTS?: R2Bucket;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

/** The email Worker's public URL. Simpler than a service binding. */
const EMAIL_WORKER = "https://ren-contact-email.idham-ecf.workers.dev";

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

  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") return cors(undefined, 200, origin);

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: "POST" },
    });
  }

  return handleContact(request, env, origin);
};

// ── CORS ────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "https://ren.shirasaka.work",
  "https://ren-portfolio.pages.dev",
];

function cors(body?: BodyInit | null, status = 200, requestOrigin?: string | null): Response {
  const origin =
    requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
      ? requestOrigin
      : ALLOWED_ORIGINS[0];
  const headers = new Headers({
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
  });
  // When the origin is reflected dynamically, Vary tells caches not to serve
  // the wrong CORS header to a different origin.
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    headers.set("vary", "Origin");
  }
  if (body && typeof body === "object" && !(body instanceof ReadableStream)) {
    headers.set("content-type", "application/json; charset=utf-8");
  }
  return new Response(body, { status, headers });
}

function jsonE(data: unknown, status = 200, origin?: string | null): Response {
  return cors(JSON.stringify(data), status, origin);
}

function errResp(message: string, status = 400, origin?: string | null): Response {
  return cors(JSON.stringify({ error: message }), status, origin);
}

// ── contact ─────────────────────────────────────────────────────────────

async function handleContact(request: Request, env: Env, origin: string | null): Promise<Response> {
  // The front end posts multipart/form-data so the browser can send a file
  // natively. `formData()` buffers the full request body in isolate memory;
  // the 25 MB cap on the client keeps this far from the 128 MB ceiling.
  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return errResp("Expected form data.", 400, origin);
  }

  const name = (fd.get("name") as string | null)?.trim() ?? "";
  const email = (fd.get("email") as string | null)?.trim() ?? "";
  const message = (fd.get("message") as string | null)?.trim() ?? "";
  const file = fd.get("attachment") as File | null;

  if (!name || name.length > MAX_NAME)
    return errResp("Please include your name.", 400, origin);
  if (!EMAIL_RE.test(email) || email.length > MAX_NAME)
    return errResp("That email address doesn't look right.", 400, origin);
  if (!message || message.length > MAX_MESSAGE)
    return errResp(`Message must be 1–${MAX_MESSAGE} characters.`, 400, origin);

  if (file && file.size > MAX_FILE)
    return errResp(`File too large (${MAX_FILE / 1024 / 1024} MB max).`, 413, origin);

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

  // ── send email via the Worker (which has the send_email binding) ──

  const to = env.CONTACT_TO;
  const from = env.CONTACT_FROM;
  if (!to || !from) {
    return errResp(
      "Mail delivery isn't configured yet. Please email ren@shirasaka.work directly.",
      503,
      origin,
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
    const workerRes = await fetch(EMAIL_WORKER, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject: `Portfolio — ${headerSafe(name)}`,
        text: emailBody,
      }),
    });

    const workerText = await workerRes.text();
    if (!workerRes.ok) {
      console.error("[contact] worker failed:", workerRes.status, workerText.slice(0, 300));
      return jsonE(
        { ok: true, note: "Email may be delayed — please email ren@shirasaka.work directly if you don't hear back." },
        200,
        origin,
      );
    }

    return jsonE({ ok: true }, 200, origin);
  } catch (e) {
    console.error("[contact] worker unreachable:", String(e?.message ?? e));
    return jsonE(
      { ok: true, note: "Email may be delayed — please email ren@shirasaka.work directly if you don't hear back." },
      200,
      origin,
    );
  }
}

function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
