"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ItemCategory } from "@/lib/types";
import { CATEGORY_EMOJI, CATEGORY_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { addEvent } from "./actions";
import { WEEKLY_EVENT_RECURRENCE } from "@/lib/event-recurrence";

const CATEGORIES: ItemCategory[] = [
  "routine",
  "hygiene",
  "meal",
  "school",
  "activity",
  "social",
  "appointment",
  "chore",
  "free_time",
  "other",
];

interface EventFormProps {
  childId: string;
}

export function EventForm({ childId }: EventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ItemCategory>("activity");
  const [recurrenceRule, setRecurrenceRule] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date || !startTime) return;

    startTransition(async () => {
      await addEvent({
        childId,
        date,
        startTime,
        endTime,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        category,
        recurrenceRule,
      });
      router.refresh();
      setTitle("");
      setDescription("");
      setLocation("");
      setEndTime("");
      setRecurrenceRule("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="event-title"
          className="mb-1 block text-sm font-bold text-ink"
        >
          What is the event?
        </label>
        <input
          id="event-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
          placeholder="Playdate with Sam"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="event-date"
            className="mb-1 block text-sm font-bold text-ink"
          >
            What day?
          </label>
          <input
            id="event-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
          />
        </div>

        <div>
          <label
            htmlFor="event-start"
            className="mb-1 block text-sm font-bold text-ink"
          >
            Starts at
          </label>
          <input
            id="event-start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="event-end"
          className="mb-1 block text-sm font-bold text-ink"
        >
          Ends at (optional)
        </label>
        <input
          id="event-end"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
        />
      </div>

      <div>
        <label
          htmlFor="event-recurrence"
          className="mb-1 block text-sm font-bold text-ink"
        >
          Repeats
        </label>
        <select
          id="event-recurrence"
          value={recurrenceRule}
          onChange={(e) => setRecurrenceRule(e.target.value)}
          className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
        >
          <option value="">Does not repeat</option>
          <option value={WEEKLY_EVENT_RECURRENCE}>Every week</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="event-location"
          className="mb-1 block text-sm font-bold text-ink"
        >
          Where is it? (optional)
        </label>
        <input
          id="event-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
          placeholder="The park, the clinic, home"
        />
      </div>

      <div>
        <label
          htmlFor="event-desc"
          className="mb-1 block text-sm font-bold text-ink"
        >
          Details (optional)
        </label>
        <textarea
          id="event-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
          placeholder="Anything helpful to know about this event"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-ink">
          Category
        </label>
        <div className="grid max-h-[92px] grid-cols-2 gap-2 overflow-y-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-md border px-3 py-2 text-left text-sm font-bold transition-colors duration-150",
                category === cat
                  ? "border-accent bg-accent-muted text-accent"
                  : "border-border bg-surface text-ink-muted hover:bg-surface-raised"
              )}
            >
              {CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-accent px-6 py-3 text-base font-bold text-ink-inverse transition-colors duration-150 hover:bg-accent-hover disabled:opacity-60"
      >
        {isPending ? "Adding..." : "Add event"}
      </button>
    </form>
  );
}