"use client";

import { AnimatePresence, motion } from "motion/react";
import { type DragEvent, useRef, useState } from "react";
import { Lottie } from "@/components/lottie/Lottie";
import { EASE } from "@/components/motion";

const MAX_FILE = 25 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Status = "idle" | "uploading" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [email, setEmail] = useState("");
  const [emailBlurred, setEmailBlurred] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupStage, setPopupStage] = useState<"sending" | "success">("sending");
  const [sendingMsg, setSendingMsg] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const dragCount = useRef(0);
  const sendingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Only show the error after the user has left the field.
  const emailValid = EMAIL_RE.test(email);
  const emailError =
    emailBlurred && email && !emailValid
      ? "That doesn't look like an email address."
      : null;

  function onEmailBlur() {
    setEmailBlurred(true);
  }

  // ── file handling ──────────────────────────────────────────────────

  function attach(f: File) {
    if (f.size > MAX_FILE) {
      setError(`${formatBytes(f.size)} — max is ${MAX_FILE / 1024 / 1024} MB.`);
      return;
    }
    setError(null);
    setFile(f);

    // Generate preview for images
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setFilePreview(null);
    }
  }

  function removeFile() {
    setFile(null);
    setFilePreview(null);
    setError(null);
    setProgress(0);
  }

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
  function onDragOver(e: DragEvent) { e.preventDefault(); }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragCount.current = 0;
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) attach(f);
  }

  // ── submit ─────────────────────────────────────────────────────────

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Honeypot
    if (fd.get("website")) {
      setStatus("sent");
      return;
    }

    const emailVal = (fd.get("email") as string).trim();
    setEmail(emailVal);
    setEmailBlurred(true);
    if (!EMAIL_RE.test(emailVal)) return;

    // Reset and open the popup
    setSendingMsg(0);
    setPopupOpen(true);
    setPopupStage("sending");
    setStatus(file ? "uploading" : "sending");
    setError(null);
    setProgress(0);

    // Fake progress messages so the user knows nothing is stuck.
    const messages = file
      ? ["Verifying the email…", "Uploading your file…", "Sending to server…", "Almost there…"]
      : ["Verifying the email…", "Sending to server…", "Almost there…"];
    sendingTimer.current = setInterval(() => {
      setSendingMsg((n) => Math.min(n + 1, messages.length - 1));
    }, 1800);

    if (file) fd.set("attachment", file);

    try {
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
              note?: string;
              error?: string;
            };
            if (xhr.status >= 200 && xhr.status < 300 && r.ok) resolve();
            else if (xhr.status === 503 && r.error)
              resolve(); // server-side not configured — not the user's fault
            else
              reject(
                new Error(
                  r.error ?? r.note ?? `Something went wrong (${xhr.status})`,
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

      // Switch popup to success animation
      if (sendingTimer.current) { clearInterval(sendingTimer.current); sendingTimer.current = null; }
      setPopupStage("success");
      setStatus("sent");
      form.reset();
      setEmail("");
      setEmailBlurred(false);
      setFile(null);
      setFilePreview(null);
      setProgress(0);
    } catch (err) {
      if (sendingTimer.current) { clearInterval(sendingTimer.current); sendingTimer.current = null; }
      setPopupOpen(false);
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong — try again?",
      );
    }
  }

  // ── popup close after success animation ───────────────────────────

  function onSuccessComplete() {
    setPopupOpen(false);
  }

  // ── sent state ─────────────────────────────────────────────────────

  if (status === "sent" && !popupOpen) {
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
          <p className="text-5xl" aria-hidden>٩(◕‿◕｡)۶</p>
          <h3 className="text-gradient mt-5 font-display text-2xl font-extrabold">
            You actually mailed me?!
          </h3>
          <p className="mt-3 max-w-sm text-ink-500">
            It landed. I&rsquo;ll get back to you — usually within a day or two, JST.
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
    <>
      <form ref={formRef} onSubmit={onSubmit} className="space-y-6" noValidate>
        {/* ── name + email ───────────────────────────────────────── */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Your name" name="name" autoComplete="name" placeholder="Shirasaka Ren" required />
          <div>
            <label className="block" htmlFor="contact-email">
              <span className="font-display text-sm font-bold text-sakura-800">
                Email
              </span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={200}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={onEmailBlur}
              className={`mt-2 w-full rounded-[1.2rem] border px-4 py-3.5 text-[0.95rem] text-ink-900 placeholder:text-ink-300 focus:outline-none transition-colors ${
                emailError
                  ? "border-red-400 bg-red-50 focus:border-red-500"
                  : "border-sakura-200 bg-white/85 focus:border-sakura-400"
              }`}
            />
            {emailError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-500">
                <span aria-hidden>⚠</span> {emailError}
              </p>
            )}
          </div>
        </div>

        {/* ── message ─────────────────────────────────────────────── */}
        <label className="block">
          <span className="flex items-center gap-2 font-display text-sm font-bold text-sakura-800">
            What&rsquo;s on your mind?
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

        {/* ── attachment card (above the button) ──────────────────── */}
        <AttachmentCard
          file={file}
          filePreview={filePreview}
          dragging={dragging}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onFileChange={(e) => { const f = e.target.files?.[0]; if (f) attach(f); }}
          onRemove={removeFile}
          disabled={status === "uploading" || status === "sending"}
        />

        {/* Honeypot */}
        <div aria-hidden className="absolute -left-[9999px] opacity-0">
          <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>

        {/* ── submit ──────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={status === "uploading" || status === "sending" || !!emailError}
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-linear-to-r from-sakura-600 to-lilac-400 px-8 py-4 font-display text-lg font-bold text-white shadow-[0_14px_38px_-14px_rgba(214,51,108,0.8)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
        >
          {status === "uploading" || status === "sending" ? "sending…" : "send it"}
          <span aria-hidden>♡</span>
        </button>

        {/* ── upload progress ─────────────────────────────────────── */}
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

        {/* ── error ───────────────────────────────────────────────── */}
        {status === "error" && error && (
          <p
            role="alert"
            className="rounded-2xl border border-sakura-300 bg-sakura-100 px-5 py-3.5 text-sm font-semibold text-sakura-700"
          >
            {error}
          </p>
        )}
      </form>

      {/* ── submission popup ───────────────────────────────────────── */}
      <SubmissionPopup
        open={popupOpen}
        stage={popupStage}
        sendingMsgIndex={sendingMsg}
        hasFile={!!file}
        onSuccessComplete={onSuccessComplete}
      />
    </>
  );
}

// ── submission popup ────────────────────────────────────────────────────

const SENDING_MESSAGES = [
  "Verifying the email…",
  "Uploading your file…",
  "Sending to server…",
  "Almost there…",
];

function SubmissionPopup({
  open,
  stage,
  sendingMsgIndex,
  hasFile,
  onSuccessComplete,
}: {
  open: boolean;
  stage: "sending" | "success";
  sendingMsgIndex: number;
  hasFile: boolean;
  onSuccessComplete: () => void;
}) {
  const msgs = hasFile ? SENDING_MESSAGES : SENDING_MESSAGES.filter((_, i) => i !== 1);
  const msg = msgs[Math.min(sendingMsgIndex, msgs.length - 1)] ?? msgs[msgs.length - 1];
  const pct = Math.round(((sendingMsgIndex + 1) / msgs.length) * 100);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <motion.div
            className="absolute inset-0 bg-ink-900/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="glass rounded-blob relative flex flex-col items-center gap-5 px-10 py-12 shadow-[0_30px_80px_-30px_rgba(214,51,108,0.8)] sm:px-14 sm:py-14"
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {stage === "sending" ? (
              <>
                <Lottie
                  src="/sending.lottie"
                  loop
                  autoplay
                  className="w-full max-w-[16rem]"
                  label="Sending your message"
                />
                <p className="text-gradient font-display text-xl font-extrabold">
                  {msg}
                </p>
                {/* Progress bar */}
                <div className="w-full max-w-[14rem]">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-sakura-200/70">
                    <motion.div
                      className="h-full rounded-full bg-linear-to-r from-sakura-600 to-lilac-400"
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: EASE }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <AnimatePresence>
                <motion.div
                  key="success"
                  className="flex flex-col items-center gap-5"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                >
                  <Lottie
                    src="/submit-success.lottie"
                    loop={false}
                    autoplay
                    speed={1.3}
                    className="w-full max-w-[14rem]"
                    label="Message sent"
                    onComplete={onSuccessComplete}
                  />
                  <p className="text-gradient font-display text-xl font-extrabold">
                    sent!
                  </p>
                  <p className="-mt-2 text-sm text-ink-500">
                    landing in my inbox right now
                  </p>
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── attachment card ─────────────────────────────────────────────────────

function AttachmentCard({
  file,
  filePreview,
  dragging,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileChange,
  onRemove,
  disabled,
}: {
  file: File | null;
  filePreview: string | null;
  dragging: boolean;
  onDragEnter: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        className="glass rounded-[1.3rem] flex items-center gap-4 p-4"
      >
        {/* file preview */}
        {filePreview ? (
          <span className="size-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-sakura-200/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={filePreview}
              alt=""
              className="h-full w-full object-cover"
            />
          </span>
        ) : (
          <FileIcon type={file.type} />
        )}
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
            className="grid size-9 shrink-0 place-items-center rounded-full border border-sakura-200 bg-white/80 text-sakura-700 transition-colors hover:bg-sakura-100"
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
            dragging
              ? "bg-sakura-600 text-white"
              : "bg-sakura-100 text-sakura-400"
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
          any type · up to 25 MB — diagrams, logs, NDA, whatever helps
        </span>
      </span>
      <input
        id={id}
        type="file"
        onChange={onFileChange}
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
