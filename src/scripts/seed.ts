/**
 * Creates clearly synthetic demo data in a local development database.
 * Requires ALLOW_DEMO_SEED=true, DATABASE_URL, and DEMO_ACCOUNT_PASSWORD.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hash } from "bcryptjs";
import * as schema from "../lib/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;
const DEMO_ACCOUNT_PASSWORD = process.env.DEMO_ACCOUNT_PASSWORD;

async function seed() {
  if (process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error("Set ALLOW_DEMO_SEED=true to create demo data.");
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo data cannot be seeded in production.");
  }
  if (!DATABASE_URL || !DEMO_ACCOUNT_PASSWORD || DEMO_ACCOUNT_PASSWORD.length < 16) {
    throw new Error("Set DATABASE_URL and a DEMO_ACCOUNT_PASSWORD of at least 16 characters.");
  }
  const client = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(client, { schema });

  console.log("Seeding database...");

  // Create family
  const [family] = await db
    .insert(schema.families)
    .values({ name: "Sample Family" })
    .returning();
  console.log(`Created family: ${family.name} (${family.id})`);

  // Create parent
  const parentHash = await hash(DEMO_ACCOUNT_PASSWORD, 12);
  const [parent] = await db
    .insert(schema.users)
    .values({
      familyId: family.id,
      role: "parent",
      email: "parent@example.com",
      passwordHash: parentHash,
      displayName: "Demo Parent",
    })
    .returning();
  console.log(`Created parent: ${parent.displayName} (${parent.email})`);

  // Create a second demo parent account.
  const parent2Hash = await hash(DEMO_ACCOUNT_PASSWORD, 12);
  const [parent2] = await db
    .insert(schema.users)
    .values({
      familyId: family.id,
      role: "parent",
      email: "parent2@example.com",
      passwordHash: parent2Hash,
      displayName: "Second Parent",
    })
    .returning();
  console.log(`Created parent: ${parent2.displayName} (${parent2.email})`);

  // Create child user account
  const childHash = await hash(DEMO_ACCOUNT_PASSWORD, 12);
  const [childUser] = await db
    .insert(schema.users)
    .values({
      familyId: family.id,
      role: "child",
      email: "child@example.com",
      passwordHash: childHash,
      displayName: "Demo Child",
    })
    .returning();

  // Create child profile
  const [child] = await db
    .insert(schema.children)
    .values({
      familyId: family.id,
      userId: childUser.id,
      displayName: "Demo Child",
      dateOfBirth: null,
      consentGivenBy: parent.id,
    })
    .returning();
  console.log(`Created child: ${child.displayName} (${child.id})`);

  // Create routine templates (weekdays)
  const weekdayRoutines = [
    { time: "07:00", end: "07:30", title: "Wake up and get dressed", cat: "routine" as const },
    { time: "07:30", end: "08:00", title: "Brush teeth and wash face", cat: "hygiene" as const },
    { time: "08:00", end: "08:30", title: "Breakfast", cat: "meal" as const },
    { time: "08:30", end: "09:00", title: "Pack school bag", cat: "school" as const },
    { time: "18:00", end: "18:30", title: "Dinner", cat: "meal" as const },
    { time: "19:00", end: "19:30", title: "Shower and pyjamas", cat: "hygiene" as const },
    { time: "19:30", end: "21:00", title: "Free time", cat: "free_time" as const },
  ];

  for (let day = 0; day < 5; day++) {
    for (const [i, r] of weekdayRoutines.entries()) {
      await db.insert(schema.routineTemplates).values({
        childId: child.id,
        dayOfWeek: day,
        startTime: r.time,
        endTime: r.end,
        title: r.title,
        category: r.cat,
        sortOrder: i,
        createdBy: parent.id,
      });
    }
  }
  console.log("Created weekday routine templates (Mon-Fri)");

  // Saturday swimming
  await db.insert(schema.routineTemplates).values({
    childId: child.id,
    dayOfWeek: 5,
    startTime: "10:00",
    endTime: "11:00",
    title: "Swimming lesson",
    description: "Take towel and goggles",
    category: "activity",
    sortOrder: 0,
    createdBy: parent.id,
  });
  console.log("Created Saturday swimming lesson");

  // Create today's schedule items
  const today = new Date().toISOString().split("T")[0];
  const todayItems = [
    { time: "07:00", end: "07:30", title: "Wake up and get dressed", cat: "routine" as const, status: "done" as const },
    { time: "07:30", end: "08:00", title: "Brush teeth and wash face", cat: "hygiene" as const, status: "done" as const },
    { time: "08:00", end: "08:30", title: "Breakfast", cat: "meal" as const, status: "in_progress" as const },
    { time: "08:30", end: "09:00", title: "Pack school bag", cat: "school" as const, status: "pending" as const },
    { time: "09:00", end: "15:30", title: "School", cat: "school" as const, status: "pending" as const },
    { time: "16:00", end: "17:00", title: "Time with a friend", cat: "social" as const, status: "pending" as const },
    { time: "18:00", end: "18:30", title: "Dinner", cat: "meal" as const, status: "pending" as const },
    { time: "19:00", end: "19:30", title: "Shower and pyjamas", cat: "hygiene" as const, status: "pending" as const },
    { time: "19:30", end: "21:00", title: "Free time", cat: "free_time" as const, status: "pending" as const },
  ];

  for (const item of todayItems) {
    await db.insert(schema.scheduleItems).values({
      childId: child.id,
      date: today,
      startTime: item.time,
      endTime: item.end,
      title: item.title,
      category: item.cat,
      status: item.status,
      createdBy: parent.id,
    });
  }
  console.log(`Created ${todayItems.length} schedule items for today (${today})`);

  console.log("\nSeed complete!");
  console.log("Demo users created: parent@example.com, parent2@example.com, child@example.com");
  console.log("Use DEMO_ACCOUNT_PASSWORD to sign in. Do not reuse it outside a local demo database.");

  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
