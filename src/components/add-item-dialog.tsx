"use client";

import { useState } from "react";
import type { ItemCategory } from "@/lib/types";
import { CATEGORY_EMOJI, CATEGORY_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  RECURRENCE_OPTIONS,
  WEEKLY_RECURRENCE,
  type RecurrenceRule,
} from "@/lib/event-recurrence";

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

interface AddItemDialogProps {
  day: number;
  date: string;
  time: string;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    category: ItemCategory;
    day: number;
    startTime: string;
    endTime: string;
    recurrenceRule: RecurrenceRule;
    anchorDate: string;
  }) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getEndTime(startTime: string): string {
  const [h, m] = startTime.split(":").map(Number);
  const endM = m + 30;
  if (endM >= 60) {
    return `${(h + 1).toString().padStart(2, "0")}:00`;
  }
  return `${h.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
}

export function AddItemDialog({ day, date, time, onClose, onSave }: AddItemDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ItemCategory>("routine");
  const [endTime, setEndTime] = useState(getEndTime(time));
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>(WEEKLY_RECURRENCE);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      day,
      startTime: time,
      endTime,
      recurrenceRule,
      anchorDate: date,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-overlay p-4">
      <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg border border-border bg-surface p-6">
        <h2 className="text-lg font-bold text-ink">
          Add routine — {DAYS[day]} at{" "}
          {(() => {
            const [h, m] = time.split(":").map(Number);
            const ampm = h >= 12 ? "pm" : "am";
            const hour = h % 12 || 12;
            return `${hour}:${m.toString().padStart(2, "0")}${ampm}`;
          })()}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Choose how often this schedule entry repeats.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label
              htmlFor="item-title"
              className="mb-1 block text-sm font-bold text-ink"
            >
              What should they do?
            </label>
            <input
              id="item-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
              placeholder="Brush teeth"
            />
          </div>

          <div>
            <label
              htmlFor="item-desc"
              className="mb-1 block text-sm font-bold text-ink"
            >
              Details (optional)
            </label>
            <textarea
              id="item-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
              placeholder="Any extra info to help them remember"
            />
          </div>

          <div>
            <label
              htmlFor="item-recurrence"
              className="mb-1 block text-sm font-bold text-ink"
            >
              Repeat?
            </label>
            <select
              id="item-recurrence"
              value={recurrenceRule}
              onChange={(e) => setRecurrenceRule(e.target.value as RecurrenceRule)}
              className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
            >
              {RECURRENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-ink">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
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

          <div>
            <label
              htmlFor="item-end"
              className="mb-1 block text-sm font-bold text-ink"
            >
              Ends at
            </label>
            <input
              id="item-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-md bg-accent px-6 py-3 text-base font-bold text-ink-inverse transition-colors duration-150 hover:bg-accent-hover"
            >
              Add schedule entry
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border-strong bg-surface px-6 py-3 text-base font-bold text-ink-muted transition-colors duration-150 hover:bg-surface-raised"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
