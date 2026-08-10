/**
 * Thin email relay for the Pages contact form.
 *
 * The Pages Function handles multipart parsing and R2 upload. This Worker
 * handles only email delivery, because Pages has no send_email binding.
 *
 * Called as a Service Binding from the Pages Function via
 * env.EMAIL_WORKER.fetch(request).
 */

import { EmailMessage } from "cloudflare:email";

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Expected JSON" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const { from, to, rawMime } = body;
    if (!from || !to || !rawMime) {
      return new Response(
        JSON.stringify({ error: "Missing from, to, or rawMime" }),
        { status: 400, headers: { "content-type": "application/json" } },
      );
    }

    if (!env.SEND_EMAIL) {
      return new Response(
        JSON.stringify({
          error: "Email binding not configured on this Worker.",
        }),
        { status: 503, headers: { "content-type": "application/json" } },
      );
    }

    try {
      await env.SEND_EMAIL.send(new EmailMessage(from, to, rawMime));
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    } catch (err) {
      console.error("[email-worker] send failed:", String(err?.message ?? err));
      return new Response(
        JSON.stringify({ error: String(err?.message ?? err) }),
        { status: 502, headers: { "content-type": "application/json" } },
      );
    }
  },
};
