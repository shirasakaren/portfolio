/**
 * Email relay for the Pages contact form.
 *
 * Uses the Cloudflare send_email Workers binding, which requires Email Routing
 * enabled on the zone and the destination address verified.
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
      return json({ error: "Expected JSON" }, 400);
    }

    const { from, to, subject, text } = body;
    if (!from || !to || !subject || !text) {
      return json({ error: "Missing from, to, subject, or text" }, 400);
    }

    if (!env.SEND_EMAIL) {
      return json({ error: "send_email binding not configured" }, 503);
    }

    const raw = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `Date: ${new Date().toUTCString()}`,
      "",
      text,
    ].join("\r\n");

    try {
      await env.SEND_EMAIL.send(new EmailMessage(from, to, raw));
      return json({ ok: true }, 200);
    } catch (err) {
      const msg = String(err?.message ?? err);
      console.error("[email-worker] send failed:", msg);
      return json({ error: msg }, 502);
    }
  },
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
