"use client";

import { useEffect, useRef, useState } from "react";
import {
  addComment,
  getComments,
} from "@/app/dashboard/comment-actions";
import { cn } from "@/lib/utils";

interface CommentWithAuthor {
  id: string;
  body: string;
  createdAt: Date;
  authorName: string;
  authorRole: string;
}

interface CommentThreadProps {
  parentType: "schedule_item" | "event";
  parentId: string;
}

function relativeTime(date: Date): string {
  const now = Date.now();
  const then = date.getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RoleBadge({ role }: { role: string }) {
  const isParent = role === "parent";
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide",
        isParent ? "bg-accent-muted text-accent" : "bg-done-bg text-done"
      )}
    >
      {isParent ? "Parent" : "Child"}
    </span>
  );
}

export function CommentThread({ parentType, parentId }: CommentThreadProps) {
  const [commentsList, setCommentsList] = useState<CommentWithAuthor[]>([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    const controller = { cancelled: false };

    getComments(parentType, parentId).then((rows) => {
      if (!controller.cancelled) {
        setCommentsList(rows);
      }
    });

    return () => {
      controller.cancelled = true;
      activeRef.current = false;
    };
  }, [parentType, parentId]);

  async function refreshComments() {
    const rows = await getComments(parentType, parentId);
    if (activeRef.current) {
      setCommentsList(rows);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (trimmed.length === 0) return;

    setSubmitting(true);
    setError(null);

    const result = await addComment(parentType, parentId, trimmed);

    if ("error" in result && result.error) {
      setError(result.error);
    } else {
      setBody("");
      await refreshComments();
    }

    setSubmitting(false);
  }

  return (
    <div className="mt-3">
      {/* Comment list */}
      {commentsList.length > 0 && (
        <ul className="space-y-3">
          {commentsList.map((c) => (
            <li key={c.id} className="rounded-md bg-surface-raised p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-ink">
                  {c.authorName}
                </span>
                <RoleBadge role={c.authorRole} />
                <span className="ml-auto text-xs text-ink-muted">
                  {relativeTime(c.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      {commentsList.length === 0 && (
        <p className="text-sm text-ink-muted">No comments yet.</p>
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="mt-3">
        <label
          htmlFor={`comment-input-${parentId}`}
          className="mb-1 block text-xs font-bold tracking-wide text-ink-muted"
        >
          Add a comment
        </label>
        <textarea
          id={`comment-input-${parentId}`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-border-strong bg-surface px-3.5 py-2.5 text-base text-ink focus:border-2 focus:border-focus-ring focus:outline-none"
        />
        {error && (
          <p className="mt-1 text-sm font-bold text-error">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting || body.trim().length === 0}
          className="mt-2 min-h-[44px] min-w-[44px] rounded-md bg-accent px-5 py-2.5 text-xs font-bold tracking-wide text-ink-inverse transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post comment"}
        </button>
      </form>
    </div>
  );
}
