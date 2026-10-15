"use client";

import { useState, useTransition } from "react";
import { addAttachmentUrl } from "@/app/dashboard/attachment-actions";
import type { AttachmentParentType } from "@/lib/types";

interface AddAttachmentProps {
  parentType: AttachmentParentType;
  parentId: string;
  onAdded?: () => void;
}

export function AddAttachment({ parentType, parentId, onAdded }: AddAttachmentProps) {
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    startTransition(async () => {
      const result = await addAttachmentUrl(
        parentType,
        parentId,
        url,
        fileName
      );
      if (result.error) {
        setError(result.error);
      } else {
        setUrl("");
        setFileName("");
        onAdded?.();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <div>
        <label
          htmlFor={`attachment-url-${parentId}`}
          className="mb-1 block text-xs font-bold tracking-wide text-ink-muted uppercase"
        >
          Add attachment
        </label>
        <input
          id={`attachment-url-${parentId}`}
          type="text"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL (YouTube, image, document, or link)"
          required
          className="w-full rounded-sm border border-border-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-2 focus:border-focus-ring focus:outline-none"
        />
      </div>
      <div>
        <label
          htmlFor={`attachment-name-${parentId}`}
          className="mb-1 block text-xs font-bold tracking-wide text-ink-muted uppercase"
        >
          Name (optional)
        </label>
        <input
          id={`attachment-name-${parentId}`}
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Display name for this attachment"
          className="w-full rounded-sm border border-border-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-2 focus:border-focus-ring focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={isPending || !url.trim()}
        className="rounded-sm bg-accent px-4 py-2 text-xs font-bold tracking-wide text-ink-inverse uppercase transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50"
      >
        {isPending ? "Adding..." : "Add attachment"}
      </button>
    </form>
  );
}