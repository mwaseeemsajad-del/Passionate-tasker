"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CheckKind } from "@/types/accounts";
import { documentUploaded } from "../actions";

// Same limits as the storage bucket (migration 0011), checked here first so the message is clear.
const MAX_BYTES = 10 * 1024 * 1024;
const TYPES = ["application/pdf", "image/jpeg", "image/png", "image/heic", "image/heif", "image/webp"];

/**
 * Upload one document for a check, straight from the browser to private
 * storage (the person's own folder; nobody else but the team can open it).
 */
export function DocumentUpload({ providerId, checkId, kind, title }: { providerId: string; checkId: string; kind: CheckKind; title: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = `upload-${checkId}`;

  const upload = (file: File) => {
    if (!TYPES.includes(file.type)) return setMessage({ ok: false, text: "Choose a PDF or a photo (JPG, PNG or HEIC)." });
    if (file.size > MAX_BYTES) return setMessage({ ok: false, text: "This file is bigger than 10 MB. Take a smaller photo, or save it as a PDF." });
    start(async () => {
      setMessage(null);
      const safeName = file.name.replace(/[^\w.-]+/g, "-").slice(-80) || "document";
      const { error } = await createClient()
        .storage.from("provider-documents")
        .upload(`${providerId}/${kind}/${Date.now()}-${safeName}`, file, { contentType: file.type });
      if (error) return setMessage({ ok: false, text: "The upload did not work. Check your connection and try again." });
      const r = await documentUploaded(checkId);
      setMessage(r.ok ? { ok: true, text: `Sent: ${file.name}. We will check it and let you know.` } : { ok: false, text: r.errors[0]?.message ?? "Please try again." });
      if (input.current) input.current.value = "";
    });
  };

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="font-medium">
        Upload a document<span className="sr-only"> for {title}</span>
      </label>
      <p id={`${id}-hint`} className="-mt-1 text-[0.9375rem] text-text-3">
        A PDF or a clear photo, up to 10 MB. Only you and our team can open it.
      </p>
      <input
        ref={input}
        id={id}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp,application/pdf,image/*"
        aria-describedby={`${id}-hint ${id}-status`}
        disabled={pending}
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        className="min-h-11 w-full max-w-md cursor-pointer rounded-md border border-line bg-white p-2 file:mr-4 file:min-h-9 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-4 file:font-medium file:text-white disabled:opacity-50"
      />
      <p id={`${id}-status`} role="status" className={message?.ok ? "font-semibold text-accent-strong" : "font-semibold text-danger"}>
        {pending ? "Uploading…" : message?.text}
      </p>
    </div>
  );
}
