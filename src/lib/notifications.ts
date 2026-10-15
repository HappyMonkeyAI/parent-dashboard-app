import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

// Internal helper. Do not export this from a "use server" action module:
// action exports can be invoked directly by a browser.
export async function createNotification(
  userId: string,
  title: string,
  body?: string,
  link?: string
) {
  await db.insert(notifications).values({
    userId,
    title,
    body: body || null,
    link: link || null,
  });
}
