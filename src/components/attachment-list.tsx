"use client";

import type { Attachment } from "@/lib/types";
import { deleteAttachment } from "@/app/dashboard/attachment-actions";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isDocumentType(fileType: string): boolean {
  return (
    fileType === "application/pdf" ||
    fileType === "application/msword" ||
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

function isYouTubeType(fileType: string): boolean {
  return fileType === "youtube";
}

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;
    const searchParams = parsed.searchParams;

    let id: string | null = null;
    if (hostname === "youtu.be" || hostname === "www.youtu.be") {
      id = pathname.slice(1) || null;
    } else if (hostname.includes("youtube.com")) {
      const vParam = searchParams.get("v");
      if (vParam) {
        id = vParam;
      } else {
        const embedMatch = pathname.match(/\/embed\/([^/]+)/);
        if (embedMatch) id = embedMatch[1];
        const shortsMatch = pathname.match(/\/shorts\/([^/]+)/);
        if (shortsMatch) id = shortsMatch[1];
      }
    }

    if (id && /^[a-zA-Z0-9_-]{1,20}$/.test(id)) {
      return id;
    }
  } catch {
    return null;
  }
  return null;
}

function isImageUrl(url: string, fileType?: string): boolean {
  if (fileType && fileType.startsWith("image/")) return true;
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    const search = parsed.search.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();

    if (/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(pathname)) return true;

    if (
      hostname.includes("images.unsplash.com") ||
      hostname.includes("imgur.com") ||
      hostname.includes("giphy.com") ||
      hostname.includes("pixabay.com") ||
      hostname.includes("cloudinary.com") ||
      pathname.includes("/photo-")
    ) {
      return true;
    }

    if (
      search.includes("format=") ||
      search.includes("fm=jpg") ||
      search.includes("fm=png") ||
      search.includes("fm=webp")
    ) {
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

function getCleanHostname(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function ImageAttachment({ attachment }: { attachment: Attachment }) {
  const displayTitle =
    attachment.fileName && attachment.fileName !== attachment.fileUrl
      ? attachment.fileName
      : null;

  return (
    <div className="flex flex-col gap-1 max-w-full overflow-hidden">
      <a
        href={attachment.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block max-w-full overflow-hidden rounded-md border border-border bg-surface transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        title={`View full image: ${attachment.fileName}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.fileUrl}
          alt={attachment.fileName || "Attachment image"}
          className="max-h-64 max-w-full rounded-md object-contain"
        />
      </a>
      {displayTitle && (
        <span className="block truncate text-xs text-ink-muted max-w-full">
          {displayTitle}
        </span>
      )}
    </div>
  );
}

function DocumentAttachment({ attachment }: { attachment: Attachment }) {
  const sizeLabel = formatFileSize(attachment.fileSize);
  return (
    <a
      href={attachment.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex max-w-full items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-left transition-colors duration-150 hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent overflow-hidden"
    >
      <span className="text-lg shrink-0" aria-hidden="true">
        📄
      </span>
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="block truncate text-sm font-bold text-ink">
          {attachment.fileName}
        </span>
        {sizeLabel && (
          <span className="block truncate text-xs text-ink-muted">{sizeLabel}</span>
        )}
      </span>
    </a>
  );
}

function YouTubeAttachment({ attachment }: { attachment: Attachment }) {
  const videoId = extractYouTubeId(attachment.fileUrl);

  if (!videoId) {
    return <LinkAttachment attachment={attachment} />;
  }

  const displayTitle =
    attachment.fileName && attachment.fileName !== attachment.fileUrl
      ? attachment.fileName
      : null;

  return (
    <div className="w-full max-w-full overflow-hidden rounded-md border border-border bg-surface">
      <div className="relative aspect-video w-full max-w-lg">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={attachment.fileName || "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full rounded-md border-0"
        />
      </div>
      {displayTitle && (
        <div className="px-3 py-1.5 border-t border-border">
          <p className="truncate text-xs font-bold text-ink">{displayTitle}</p>
        </div>
      )}
    </div>
  );
}

function LinkAttachment({ attachment }: { attachment: Attachment }) {
  const displayTitle =
    attachment.fileName && attachment.fileName !== attachment.fileUrl
      ? attachment.fileName
      : getCleanHostname(attachment.fileUrl);

  return (
    <a
      href={attachment.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex max-w-full items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-left transition-colors duration-150 hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent overflow-hidden"
    >
      <span className="text-lg shrink-0" aria-hidden="true">
        🔗
      </span>
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="block truncate text-sm font-bold text-ink">
          {displayTitle}
        </span>
        <span className="block truncate text-xs text-ink-muted">
          {attachment.fileUrl}
        </span>
      </span>
    </a>
  );
}

interface AttachmentListProps {
  attachments: Attachment[];
  onDeleted?: () => void;
}

export function AttachmentList({ attachments, onDeleted }: AttachmentListProps) {
  if (attachments.length === 0) return null;

  async function handleDelete(id: string) {
    await deleteAttachment(id);
    onDeleted?.();
  }

  return (
    <div className="mt-3 space-y-2 max-w-full overflow-hidden">
      <p className="text-xs font-bold tracking-wide text-ink-muted uppercase">
        Attachments
      </p>
      <div className="flex flex-col gap-2.5 max-w-full">
        {attachments.map((attachment) => {
          const ytId = extractYouTubeId(attachment.fileUrl);
          const isImg = isImageUrl(attachment.fileUrl, attachment.fileType);

          let content;
          if (isYouTubeType(attachment.fileType) || ytId) {
            content = <YouTubeAttachment attachment={attachment} />;
          } else if (isImg) {
            content = <ImageAttachment attachment={attachment} />;
          } else if (isDocumentType(attachment.fileType)) {
            content = <DocumentAttachment attachment={attachment} />;
          } else {
            content = <LinkAttachment attachment={attachment} />;
          }

          return (
            <div key={attachment.id} className="group relative flex items-start gap-2 max-w-full overflow-hidden">
              <div className="min-w-0 flex-1 max-w-full overflow-hidden">
                {content}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(attachment.id)}
                className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-error text-white transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
                aria-label="Delete attachment"
                title="Delete attachment"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M2 2l8 8M10 2l-8 8" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}