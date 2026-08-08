"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Posts to /api/contact, which is a Cloudflare Pages Function — the only
 * server-side code on the site. Everything else is static.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot: real people never fill this in.
    if (data.get("website")) {
      setStatus("sent");
      return;
    }

    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? `Something went wrong (${res.status})`);
      }

      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="rounded-blob border border-sakura-300/70 bg-linear-to-br from-white/90 to-sakura-100/80 p-8 text-center"
      >
        <p className="text-4xl" aria-hidden>
          ٩(◕‿◕｡)۶
        </p>
        <h3 className="mt-4 font-display text-xl font-extrabold text-sakura-800">
          You actually mailed me?!
        </h3>
        <p className="mt-2 text-ink-500">
          It landed. I&rsquo;ll get back to you — usually within a day or two,
          JST.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full border border-sakura-300 px-5 py-2.5 font-display text-sm font-bold text-sakura-700 transition-colors hover:bg-sakura-100"
        >
          send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" autoComplete="name" required />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <label className="block">
        <span className="font-display text-sm font-bold text-sakura-800">
          Message
        </span>
        <textarea
          name="message"
          rows={6}
          required
          maxLength={4000}
          placeholder="What needs keeping alive?"
          className="mt-2 w-full resize-y rounded-2xl border border-sakura-200 bg-white/85 px-4 py-3 text-ink-900 placeholder:text-ink-300 focus:border-sakura-400 focus:outline-none"
        />
      </label>

      {/* Honeypot — visually and programmatically hidden from humans. */}
      <div aria-hidden className="hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === "error" && error && (
        <p role="alert" className="text-sm font-semibold text-sakura-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-sakura-600 to-sakura-500 px-7 py-3.5 font-display font-bold text-white shadow-[0_10px_30px_-10px_rgba(214,51,108,0.65)] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {status === "sending" ? "sending…" : "send it"}
        <span aria-hidden>♡</span>
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-display text-sm font-bold text-sakura-800">
        {label}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        maxLength={200}
        className="mt-2 w-full rounded-2xl border border-sakura-200 bg-white/85 px-4 py-3 text-ink-900 placeholder:text-ink-300 focus:border-sakura-400 focus:outline-none"
      />
    </label>
  );
}
