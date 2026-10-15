"use client";

import { useState, useTransition } from "react";
import type { Event, Attachment } from "@/lib/types";
import { CATEGORY_EMOJI, CATEGORY_LABELS } from "@/lib/types";
import { DeleteEventButton } from "./delete-event-button";
import { AttachmentList } from "@/components/attachment-list";
import { AddAttachment } from "@/components/add-attachment";
import { getAttachments } from "@/app/dashboard/attachment-actions";
import { WEEKLY_EVENT_RECURRENCE } from "@/lib/event-recurrence";

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")}${ampm}`;
}

export function AdminEventCard({
  event,
  initialAttachments,
}: {
  event: Event;
  initialAttachments: Attachment[];
}) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [, startTransition] = useTransition();

  function reloadAttachments() {
    startTransition(async () => {
      const updated = await getAttachments("event", event.id);
      setAttachments(updated);
    });
  }

  return (
    <div className="rounded-md border border-border bg-surface p-4 max-w-full overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="text-base font-bold text-ink truncate">
            {CATEGORY_EMOJI[event.category]} {event.title}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {formatDate(event.date)} ·{" "}
            {event.end_time
              ? `${formatTime(event.start_time)} – ${formatTime(event.end_time)}`
              : formatTime(event.start_time)}
          </p>
          {event.location && (
            <p className="mt-1 text-sm text-ink-muted">📍 {event.location}</p>
          )}
          {event.description && (
            <p className="mt-1 text-sm text-ink-muted">{event.description}</p>
          )}
          <p className="mt-1 text-xs font-bold tracking-wide text-ink-muted uppercase">
            {CATEGORY_LABELS[event.category]}
          </p>
          {event.recurrence_rule === WEEKLY_EVENT_RECURRENCE && (
            <p className="mt-1 text-xs font-bold text-accent">Repeats weekly</p>
          )}
        </div>
        <DeleteEventButton eventId={event.id} />
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <AttachmentList attachments={attachments} onDeleted={reloadAttachments} />
        <AddAttachment
          parentType="event"
          parentId={event.id}
          onAdded={reloadAttachments}
        />
      </div>
    </div>
  );
}
