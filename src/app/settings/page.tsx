import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/queries";
import { SettingsForm } from "./settings-form";
import { PushNotificationSetup } from "@/components/push-notification-setup";
import { db } from "@/lib/db";
import { families } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    redirect("/login");
  }

  const prefs = (user as { notificationPrefs?: Record<string, unknown> }).notificationPrefs ?? {};
  const [family] = await db.select({ timeZone: families.timeZone }).from(families)
    .where(eq(families.id, user.familyId)).limit(1);

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Manage your notifications and display preferences.
        </p>
      </header>

      <SettingsForm
        userId={user.id}
        role={user.role}
        lowStimMode={user.lowStimMode}
        timeZone={family?.timeZone ?? "UTC"}
        prefs={{
          email_digest: prefs.email_digest !== false,
          push_enabled: prefs.push_enabled !== false,
          daily_lookahead: prefs.daily_lookahead !== false,
          weekly_summary: prefs.weekly_summary === true,
          quiet_hours_start: (prefs.quiet_hours_start as string) || "21:00",
          quiet_hours_end: (prefs.quiet_hours_end as string) || "07:00",
        }}
      />
      <div className="mt-6">
        <PushNotificationSetup />
      </div>
    </main>
  );
}
