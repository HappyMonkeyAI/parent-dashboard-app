"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ScheduleBuilder } from "@/components/schedule-builder";
import { AddItemDialog } from "@/components/add-item-dialog";
import { EditItemDialog } from "@/components/edit-item-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ChildSelector } from "@/components/child-selector";
import { WeekNavigator } from "@/components/week-navigator";
import {
  addRoutineTemplate,
  updateRoutineTemplate,
  deleteRoutineTemplate,
} from "@/app/admin/actions";
import type { ItemCategory, RoutineTemplate, ScheduleItem } from "@/lib/types";
import type { RecurrenceRule } from "@/lib/event-recurrence";

interface ChildOption {
  id: string;
  displayName: string;
}

interface AdminClientProps {
  templates: RoutineTemplate[];
  scheduleItems?: ScheduleItem[];
  childId: string;
  childName: string;
  mondayIso: string;
  childrenOptions: ChildOption[];
}

export function AdminClient({
  templates,
  scheduleItems,
  childId,
  childName,
  mondayIso,
  childrenOptions,
}: AdminClientProps) {
  const [dialogState, setDialogState] = useState<{
    day: number;
    date: string;
    time: string;
  } | null>(null);
  const [editTemplate, setEditTemplate] = useState<RoutineTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoutineTemplate | null>(null);
  const [, startTransition] = useTransition();

  function handleAddItem(day: number, date: string, time: string) {
    setDialogState({ day, date, time });
  }

  function handleSaveItem(data: {
    title: string;
    description: string;
    category: ItemCategory;
    day: number;
    startTime: string;
    endTime: string;
    recurrenceRule: RecurrenceRule;
    anchorDate: string;
  }) {
    setDialogState(null);
    startTransition(async () => {
      await addRoutineTemplate({
        childId,
        dayOfWeek: data.day,
        recurrenceRule: data.recurrenceRule,
        anchorDate: data.anchorDate,
        startTime: data.startTime,
        endTime: data.endTime,
        title: data.title,
        description: data.description,
        category: data.category,
      });
    });
  }

  function handleItemClick(template: RoutineTemplate) {
    setEditTemplate(template);
  }

  function handleUpdateItem(data: {
    id: string;
    title: string;
    description: string;
    category: ItemCategory;
    endTime: string;
    recurrenceRule: RecurrenceRule;
    anchorDate: string;
  }) {
    setEditTemplate(null);
    startTransition(async () => {
      await updateRoutineTemplate(data);
    });
  }

  function handleDeleteRequest(template: RoutineTemplate) {
    setEditTemplate(null);
    setDeleteTarget(template);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    startTransition(async () => {
      await deleteRoutineTemplate(id);
    });
  }

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Schedule Builder</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Building schedule for{" "}
          <strong className="font-bold text-ink">{childName}</strong>. Click an
          empty slot to add, or click a filled slot to view.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-4">
        <ChildSelector options={childrenOptions} selectedId={childId} />
        <WeekNavigator mondayIso={mondayIso} />
      </div>

      <ScheduleBuilder
        templates={templates}
        scheduleItems={scheduleItems}
        mondayIso={mondayIso}
        onAddItem={handleAddItem}
        onItemClick={handleItemClick}
        onDeleteItem={handleDeleteRequest}
      />

      {dialogState && (
        <AddItemDialog
          day={dialogState.day}
          date={dialogState.date}
          time={dialogState.time}
          onClose={() => setDialogState(null)}
          onSave={handleSaveItem}
        />
      )}

      {editTemplate && (
        <EditItemDialog
          template={editTemplate}
          onClose={() => setEditTemplate(null)}
          onSave={handleUpdateItem}
          onDelete={handleDeleteRequest}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this routine?"
          message={`"${deleteTarget.title}" will be removed from the schedule. This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/events"
          className="rounded-md border border-border bg-surface p-5 transition-colors duration-150 hover:bg-surface-raised"
        >
          <h2 className="text-base font-bold text-ink">Events</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Add playdates, appointments, and one-off or weekly events.
          </p>
        </Link>
        <Link
          href="/admin/children"
          className="rounded-md border border-border bg-surface p-5 transition-colors duration-150 hover:bg-surface-raised"
        >
          <h2 className="text-base font-bold text-ink">Children</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Manage child profiles and notification preferences.
          </p>
        </Link>
        <Link
          href="/settings"
          className="rounded-md border border-border bg-surface p-5 transition-colors duration-150 hover:bg-surface-raised"
        >
          <h2 className="text-base font-bold text-ink">Settings</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Email digests, push notifications, quiet hours.
          </p>
        </Link>
      </div>
    </>
  );
}
