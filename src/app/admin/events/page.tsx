import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getChildrenForFamily, getUpcomingEvents, getAttachmentsForItem } from "@/lib/queries";
import { ChildSelector } from "@/components/child-selector";
import { EventForm } from "./event-form";
import { AdminEventCard } from "./admin-event-card";
import type { Event, Attachment } from "@/lib/types";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "parent") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const familyChildren = await getChildrenForFamily(session.user.familyId);

  if (familyChildren.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-ink">Events</h1>
        <p className="mt-2 text-sm text-ink-muted">
          No children added yet.{" "}
          <Link
            href="/admin/children"
            className="font-bold text-accent hover:text-accent-hover"
          >
            Add a child
          </Link>{" "}
          first.
        </p>
      </main>
    );
  }

  const selected = familyChildren.find((c) => c.id === params.child);
  const child = selected || familyChildren[0];
  const rows = await getUpcomingEvents(child.id);

  const upcomingEvents: { event: Event; attachments: Attachment[] }[] = await Promise.all(
    rows.map(async (r) => {
      const event: Event = {
        id: r.id,
        child_id: r.childId,
        date: r.date,
        start_time: r.startTime,
        end_time: r.endTime,
        title: r.title,
        description: r.description,
        location: r.location,
        category: r.category as Event["category"],
        recurrence_rule: r.recurrenceRule,
        created_by: r.createdBy,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      };
      const attRows = await getAttachmentsForItem("event", r.id);
      return { event, attachments: attRows as Attachment[] };
    })
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Events</h1>
        <Link
          href="/admin"
          className="rounded-md border border-border-strong bg-surface px-4 py-2 text-sm font-bold text-ink-muted transition-colors duration-150 hover:bg-surface-raised"
        >
          Back to admin
        </Link>
      </div>

      {familyChildren.length > 1 && (
        <ChildSelector options={familyChildren} selectedId={child.id} />
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Add event form */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-ink">
            Add an event for {child.displayName}
          </h2>
          <div className="rounded-md border border-border bg-surface p-5">
            <EventForm childId={child.id} />
          </div>
        </section>

        {/* Upcoming events list */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-ink">
            Upcoming events
          </h2>
          {upcomingEvents.length === 0 ? (
            <div className="rounded-md border border-border bg-surface p-6 text-center">
              <p className="text-base font-bold text-ink">No upcoming events</p>
              <p className="mt-2 text-sm text-ink-muted">
                Add a playdate, appointment, or one-off event using the form.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingEvents.map(({ event, attachments }) => (
                <AdminEventCard
                  key={event.id}
                  event={event}
                  initialAttachments={attachments}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}