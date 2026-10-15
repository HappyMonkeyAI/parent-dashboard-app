"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "./actions";

interface DeleteEventButtonProps {
  eventId: string;
}

export function DeleteEventButton({ eventId }: DeleteEventButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteEvent(eventId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Delete event"
      className="shrink-0 rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm font-bold text-error transition-colors duration-150 hover:bg-error-bg disabled:opacity-60"
    >
      {isPending ? "..." : "Delete"}
    </button>
  );
}