"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import type { ScheduleItem, Attachment } from "@/lib/types";
import { CATEGORY_EMOJI, STATUS_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CommentThread } from "@/components/comment-thread";
import { getAttachments } from "@/app/dashboard/attachment-actions";
import { AttachmentList } from "@/components/attachment-list";
import { AddAttachment } from "@/components/add-attachment";

const statusStyles = {
  in_progress: {
    card: "border-now bg-now-bg",
    label: "text-now",
    badge: "bg-now text-ink-inverse",
  },
  done: {
    card: "border-done bg-done-bg",
    label: "text-done",
    badge: "bg-done text-ink-inverse",
  },
  pending: {
    card: "border-pending bg-pending-bg",
    label: "text-pending",
    badge: "bg-pending text-ink-inverse",
  },
  skipped: {
    card: "border-attention bg-attention-bg",
    label: "text-attention",
    badge: "bg-attention text-ink-inverse",
  },
} as const;

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")}${ampm}`;
}

interface TimelineCardProps {
  item: ScheduleItem;
  onStatusChange?: (id: string, status: ScheduleItem["status"]) => void;
  defaultExpanded?: boolean;
}

export function TimelineCard({
  item,
  onStatusChange,
  defaultExpanded = false,
}: TimelineCardProps) {
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const [attachments, setAttachments] = useState<Attachment[] | null>(null);
  const [isLoadingAttachments, startLoadingAttachments] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);
  const styles = statusStyles[item.status];
  const isNow = item.status === "in_progress";

  const expanded = userExpanded !== null ? userExpanded : defaultExpanded;

  const parentType = item.is_event ? ("event" as const) : ("schedule_item" as const);

  useEffect(() => {
    if (expanded && attachments === null) {
      startLoadingAttachments(async () => {
        const result = await getAttachments(parentType, item.id);
        setAttachments(result);
      });
    }
    if (defaultExpanded) {
      const timer = setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [defaultExpanded, expanded, attachments, item.id, parentType]);

  function toggleExpanded() {
    const next = !expanded;
    setUserExpanded(next);
    if (next && attachments === null) {
      startLoadingAttachments(async () => {
        const result = await getAttachments(parentType, item.id);
        setAttachments(result);
      });
    }
  }

  return (
    <div
      ref={cardRef}
      id={`item-${item.id}`}
      className={cn(
        "rounded-md border-l-4 transition-all duration-150",
        styles.card,
        isNow ? "p-5" : "p-4"
      )}
    >
      <button
        onClick={toggleExpanded}
        className="flex w-full items-start gap-3 text-left"
        aria-expanded={expanded}
      >
        {/* Time gutter */}
        <span
          className={cn(
            "tabular-nums mt-0.5 shrink-0 text-sm",
            isNow ? "font-bold text-now" : "text-ink-muted"
          )}
        >
          {formatTime(item.start_time)}
        </span>

        {/* Content */}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            {isNow && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold tracking-wide",
                  styles.badge
                )}
              >
                NOW
              </span>
            )}
            <span
              className={cn(
                "text-base",
                isNow ? "font-bold text-ink" : "font-bold text-ink",
                item.status === "done" && "text-ink-muted"
              )}
            >
              {CATEGORY_EMOJI[item.category]} {item.title}
            </span>
          </span>

          {item.status === "done" && (
            <span className="mt-0.5 block text-sm text-done">
              ✓ {STATUS_LABELS[item.status]}
            </span>
          )}
        </span>

        {/* Expand indicator */}
        <span className="mt-1 shrink-0 text-sm text-ink-muted">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-3 border-t border-border pt-3 pl-12">
          {item.description && (
            <p className="text-sm text-ink-muted">{item.description}</p>
          )}

          {item.location && (
            <p className="mt-1 text-sm text-ink-muted">
              📍 {item.location}
            </p>
          )}

          <p className="mt-1 text-xs text-ink-muted">
            {item.end_time
              ? `${formatTime(item.start_time)} – ${formatTime(item.end_time)}`
              : formatTime(item.start_time)}
          </p>

          {/* Status actions (child can mark done/skipped) — hidden for events */}
          {onStatusChange && !item.is_event && item.status !== "done" && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onStatusChange(item.id, "done")}
                className="rounded-md bg-done px-4 py-2 text-sm font-bold text-ink-inverse transition-colors duration-150 hover:opacity-90"
              >
                ✓ Done
              </button>
              <button
                onClick={() => onStatusChange(item.id, "skipped")}
                className="rounded-md border border-border-strong bg-surface px-4 py-2 text-sm font-bold text-ink-muted transition-colors duration-150 hover:bg-surface-raised"
              >
                Skip
              </button>
            </div>
          )}

          {/* Attachments */}
          {isLoadingAttachments && (
            <p className="mt-3 text-sm text-ink-muted">Loading attachments...</p>
          )}
          {attachments !== null && (
            <AttachmentList attachments={attachments} />
          )}
          <AddAttachment
            parentType={parentType}
            parentId={item.id}
            onAdded={() =>
              startLoadingAttachments(async () => {
                const result = await getAttachments(parentType, item.id);
                setAttachments(result);
              })
            }
          />

          {/* Comments */}
          <CommentThread parentType={parentType} parentId={item.id} />
        </div>
      )}
    </div>
  );
}
