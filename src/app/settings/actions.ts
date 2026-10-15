"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { families, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { isValidTimeZone } from "@/lib/reminder-time";

export async function updateSettings(
  userId: string,
  prefs: {
    email_digest: boolean;
    push_enabled: boolean;
    daily_lookahead: boolean;
    weekly_summary: boolean;
    quiet_hours_start: string;
    quiet_hours_end: string;
  },
  lowStimMode: boolean,
  timeZone: string
) {
  const session = await auth();
  if (!session?.user?.id || session.user.id !== userId) {
    return { error: "Not authorised" };
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(prefs.quiet_hours_start) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(prefs.quiet_hours_end)) {
    return { error: "Choose valid quiet hours." };
  }
  if (!isValidTimeZone(timeZone)) return { error: "Choose a valid time zone." };

  const [account] = await db.select({ familyId: users.familyId, role: users.role })
    .from(users).where(eq(users.id, userId)).limit(1);
  if (!account) return { error: "Account not found." };

  await db
    .update(users)
    .set({
      notificationPrefs: prefs,
      lowStimMode,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  if (account.role === "parent") {
    await db.update(families).set({ timeZone }).where(eq(families.id, account.familyId));
  }

  revalidatePath("/settings");
  return { ok: true };
}
