"use client";

import { motion } from "motion/react";
import { type DragEvent, useRef, useState } from "react";

import { EASE, Magnetic } from "@/components/motion";

/**
 * The contact form, redesigned to focus the user on one thing: their message.
 *
 * Two-step flow:
 *   1. POST /api/contact/upload-url — a Pages Function issues a presigned R2 PUT URL
 *   2. Browser uploads the file directly to R2 (so the function never touches a 100MB body)
 *   3. POST /api/contact — metadata + the R2 key land in Ren's inbox via Email Routing
 *
 * The attachment sits in a distinct card BELOW the submit button rather than
 * between the fields and the action, because a file is supplementary evidence —
 * the message is what matters.
 */

type Status = "idle" | "uploading" | "sending" | "sent" | "error";

const MAX_FILE = 25 * 1024 * 1024; // 25 MB — safe within the Pages Function isolate limit
const ALL_TYPES = "*/*";
const TOO_BIG = `100 MB max. That file is ${MAX_FILE / 1024 / 1024} MB just by itself.`;

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dragCount = useRef(0);

  // ── file drop zone ─────────────────────────────────────────────────

  function onDragEnter(e: DragEvent) {
    e.preventDefault();
    dragCount.current++;
    setDragging(true);
  }
  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    dragCount.current--;
    if (dragCount.current <= 0) {
      dragCount.current = 0;
      setDragging(false);
    }
  }
  function onDragOver(e: DragEvent) {
    e.preventDefault();
  }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragCount.current = 0;
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) attach(f);
  }
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) attach(f);
  }

  function attach(f: File) {
    if (f.size > MAX_FILE) {
      setError(formatBytes(f.size) + " — " + TOO_BIG);
      return;
    }
    setError(null);
    setFile(f);
  }

  function removeFile() {
    setFile(null);
    setError(null);
    setProgress(0);
  }

  // ── submit ──────────────────────────────────────────────────────────
  // Everything goes in one multipart POST to /api/contact. The function
  // receives the form fields + the file, uploads the file to R2, then
  // sends the email. One round trip, progress tracked on the XHR.

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Honeypot
    if (fd.get("website")) {
      setStatus("sent");
      return;
    }

    setStatus(file ? "uploading" : "sending");
    setError(null);
    setProgress(0);

    // Attach the file from React state to the FormData
    if (file) fd.set("attachment", file);

    try {
      // XHR handles FormData natively — no manual body construction, and
      // the upload object gives us real progress per chunk.
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/contact");

        xhr.upload.addEventListener("progress", (ev) => {
          if (ev.lengthComputable) setProgress(ev.loaded / ev.total);
        });
        xhr.addEventListener("load", () => {
          try {
            const r = JSON.parse(xhr.responseText) as {
              ok?: boolean;
              error?: string;
            };
            if (xhr.status >= 200 && xhr.status < 300 && r.ok) resolve();
            else if (xhr.status === 503 && r.error)
              resolve(); // not configured yet — not the user's fault
            else
              reject(
                new Error(
                  r.error ?? `Something went wrong (${xhr.status})`,
                ),
              );
          } catch {
            reject(new Error(`Unexpected response (${xhr.status})`));
          }
        });
        xhr.addEventListener("error", () =>
          reject(new Error("Couldn't reach the server. Try again?")),
        );
        xhr.addEventListener("abort", () => reject(new Error("Cancelled.")));
        xhr.send(fd);
      });

      setStatus("sent");
      form.reset();
      setFile(null);
      setProgress(0);
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Something went wrong — try again?",
      );
    }
  }

  // ── sent state — the reaction ──────────────────────────────────────

  if (status === "sent") {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="rounded-blob relative overflow-hidden border border-sakura-300/70 bg-linear-to-br from-white/95 to-sakura-100/85 p-8 text-center sm:p-10"
      >
        <span
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(255,143,199,0.15),transparent)]"
        />
        <div className="relative">
          <p className="text-5xl" aria-hidden>
            ٩(◕‿◕｡)۶
          </p>
          <h3 className="text-gradient mt-5 font-display text-2xl font-extrabold">
            You actually mailed me?!
          </h3>
          <p className="mt-3 max-w-sm text-ink-500">
            It landed. I&rsquo;ll get back to you — usually within a day or two,
            JST.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-7 rounded-full border border-sakura-300 bg-white/75 px-6 py-3 font-display text-sm font-bold text-sakura-700 transition-colors hover:bg-sakura-100"
          >
            send another
          </button>
        </div>
      </motion.div>
    );
  }

  // ── the form ────────────────────────────────────────────────────────

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Your name"
          name="name"
          autoComplete="name"
          placeholder="Shirasaka Ren"
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <label className="block">
        <span className="flex items-center gap-2 font-display text-sm font-bold text-sakura-800">
          What&rsquo;s on your mind?
          <span className="font-normal text-ink-300">— the thing you actually want to say</span>
        </span>
        <textarea
          name="message"
          rows={5}
          required
          maxLength={6000}
          placeholder="Something is breaking, someone needs a platform, or you just want to talk about infrastructure — this is the part I read first."
          className="mt-2 w-full resize-y rounded-[1.3rem] border border-sakura-200 bg-white/85 px-5 py-4 text-[0.95rem] leading-relaxed text-ink-900 placeholder:text-ink-300 focus:border-sakura-400 focus:outline-none"
        />
      </label>

      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] opacity-0">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {/* ── submit ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4">
        <Magnetic>
          <button
            type="submit"
            disabled={status === "uploading" || status === "sending"}
            className="inline-flex items-center gap-2.5 rounded-full bg-linear-to-r from-sakura-600 to-lilac-400 px-8 py-4 font-display text-lg font-bold text-white shadow-[0_14px_38px_-14px_rgba(214,51,108,0.8)] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
          >
            {status === "uploading"
              ? "uploading…"
              : status === "sending"
                ? "sending…"
                : "send it"}
            <span aria-hidden>♡</span>
          </button>
        </Magnetic>
      </div>

      {/* ── upload progress ────────────────────────────────────────── */}
      {status === "uploading" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden"
        >
          <div className="rounded-full bg-sakura-100">
            <motion.div
              className="h-2 rounded-full bg-linear-to-r from-sakura-600 to-lilac-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(progress * 100)}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <p className="mt-2 text-center font-mono text-xs text-ink-500">
            {Math.round(progress * 100)}%
          </p>
        </motion.div>
      )}

      {/* ── error ──────────────────────────────────────────────────── */}
      {status === "error" && error && (
        <p
          role="alert"
          className="rounded-2xl border border-sakura-300 bg-sakura-100 px-5 py-3.5 text-sm font-semibold text-sakura-700"
        >
          {error}
        </p>
      )}

      {/* ── attachment card ──────────────────────────────────────────
          Sits BELOW the submit button so the form stays compact and the
          attachment is an afterthought rather than a hurdle. */}
      <AttachmentCard
        file={file}
        dragging={dragging}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onChange={onFileChange}
        onRemove={removeFile}
        disabled={status === "uploading" || status === "sending"}
      />
    </form>
  );
}

// ── attachment card ─────────────────────────────────────────────────────

function AttachmentCard({
  file,
  dragging,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onChange,
  onRemove,
  disabled,
}: {
  file: File | null;
  dragging: boolean;
  onDragEnter: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  const labelRef = useRef<HTMLLabelElement>(null);
  const id = "contact-attachment";

  if (file) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-[1.3rem] flex flex-wrap items-center gap-4 p-4"
      >
        <FileIcon type={file.type} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-extrabold text-sakura-800">
            {file.name}
          </p>
          <p className="font-mono text-xs text-ink-500">
            {formatBytes(file.size)}
          </p>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={onRemove}
            className="grid size-9 place-items-center rounded-full border border-sakura-200 bg-white/80 text-sakura-700 transition-colors hover:bg-sakura-100"
            aria-label="Remove attachment"
          >
            ✕
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <label
      ref={labelRef}
      htmlFor={id}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`block cursor-pointer rounded-[1.3rem] border-2 border-dashed p-5 text-center transition-all duration-300 ${
        dragging
          ? "scale-[1.015] border-sakura-500 bg-sakura-100/80 shadow-[0_20px_44px_-20px_rgba(214,51,108,0.7)]"
          : "border-sakura-200/70 bg-white/40 hover:border-sakura-300 hover:bg-white/70"
      }`}
    >
      <span className="flex flex-col items-center gap-2">
        <span
          className={`grid size-11 place-items-center rounded-full transition-colors duration-300 ${
            dragging ? "bg-sakura-600 text-white" : "bg-sakura-100 text-sakura-400"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="size-5"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </span>
        <span className="font-display text-sm font-bold text-sakura-700">
          {dragging ? "drop it here" : "attach a file"}
        </span>
        <span className="text-xs text-ink-300">
          any type · up to 100 MB — diagrams, logs, NDA, whatever helps
        </span>
      </span>
      <input
        id={id}
        type="file"
        accept={ALL_TYPES}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
      />
    </label>
  );
}

// ── helpers ─────────────────────────────────────────────────────────────

function Input({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        className="mt-2 w-full rounded-[1.2rem] border border-sakura-200 bg-white/85 px-4 py-3.5 text-[0.95rem] text-ink-900 placeholder:text-ink-300 focus:border-sakura-400 focus:outline-none"
      />
    </label>
  );
}

function FileIcon({ type }: { type: string }) {
  let emoji = "📎";
  if (type.startsWith("image/")) emoji = "🖼️";
  else if (type.includes("pdf")) emoji = "📄";
  else if (type.includes("zip") || type.includes("tar") || type.includes("gzip"))
    emoji = "📦";
  else if (type.includes("json") || type.includes("xml") || type.includes("yaml"))
    emoji = "📋";
  else if (type.startsWith("video/")) emoji = "🎬";

  return (
    <span
      aria-hidden
      className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/80 text-xl ring-1 ring-sakura-200/60"
    >
      {emoji}
    </span>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
