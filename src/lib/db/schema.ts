import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  time,
  boolean,
  smallint,
  bigint,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ── Enums ────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["parent", "child"]);
export const itemStatusEnum = pgEnum("item_status", [
  "pending",
  "in_progress",
  "done",
  "skipped",
]);
export const itemCategoryEnum = pgEnum("item_category", [
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
]);
export const attachmentParentTypeEnum = pgEnum("attachment_parent_type", [
  "schedule_item",
  "event",
  "comment",
]);
export const commentParentTypeEnum = pgEnum("comment_parent_type", [
  "schedule_item",
  "event",
]);

// ── Families ─────────────────────────────────────────────────────────

export const families = pgTable("families", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().default("My Family"),
  timeZone: text("time_zone").notNull().default("UTC"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Users (auth + profile combined for simplicity) ───────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    role: userRoleEnum("role").notNull().default("parent"),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    notificationPrefs: jsonb("notification_prefs")
      .notNull()
      .default({
        email_digest: true,
        push_enabled: true,
        daily_lookahead: true,
        weekly_summary: false,
        quiet_hours_start: "21:00",
        quiet_hours_end: "07:00",
      }),
    lowStimMode: boolean("low_stim_mode").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_users_family").on(table.familyId)]
);

export const mobileSessions = pgTable(
  "mobile_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_mobile_sessions_user").on(table.userId)]
);

// ── Children ─────────────────────────────────────────────────────────

export const children = pgTable(
  "children",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    dateOfBirth: date("date_of_birth"),
    consentGivenAt: timestamp("consent_given_at", { withTimezone: true }).notNull().defaultNow(),
    consentGivenBy: uuid("consent_given_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_children_family").on(table.familyId)]
);

// ── Routine Templates ────────────────────────────────────────────────

export const routineTemplates = pgTable(
  "routine_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    dayOfWeek: smallint("day_of_week").notNull(),
    recurrenceRule: text("recurrence_rule").notNull().default("FREQ=WEEKLY"),
    anchorDate: date("anchor_date"),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    category: itemCategoryEnum("category").notNull().default("routine"),
    sortOrder: smallint("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_routine_templates_child").on(table.childId, table.dayOfWeek)]
);

// ── Schedule Items ───────────────────────────────────────────────────

export const scheduleItems = pgTable(
  "schedule_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    category: itemCategoryEnum("category").notNull().default("routine"),
    status: itemStatusEnum("status").notNull().default("pending"),
    templateId: uuid("template_id").references(() => routineTemplates.id, {
      onDelete: "set null",
    }),
    createdBy: uuid("created_by").references(() => users.id),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    pushReminderSentAt: timestamp("push_reminder_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_schedule_items_child_date").on(table.childId, table.date)]
);

// ── Events ───────────────────────────────────────────────────────────

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time"),
    title: text("title").notNull(),
    description: text("description"),
    location: text("location"),
    category: itemCategoryEnum("category").notNull().default("activity"),
    recurrenceRule: text("recurrence_rule"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_events_child_date").on(table.childId, table.date)]
);

// ── Comments ─────────────────────────────────────────────────────────

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentType: commentParentTypeEnum("parent_type").notNull(),
    parentId: uuid("parent_id").notNull(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_comments_parent").on(table.parentType, table.parentId)]
);

// ── Attachments ──────────────────────────────────────────────────────

export const attachments = pgTable(
  "attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentType: attachmentParentTypeEnum("parent_type").notNull(),
    parentId: uuid("parent_id").notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: text("file_type").notNull(),
    fileName: text("file_name").notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull().default(0),
    uploadedBy: uuid("uploaded_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_attachments_parent").on(table.parentType, table.parentId)]
);

// ── Notifications ────────────────────────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body"),
    link: text("link"),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_notifications_user").on(table.userId, table.isRead)]
);

// ── Web Push Subscriptions ──────────────────────────────────────────

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull().unique(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    expirationTime: timestamp("expiration_time", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_push_subscriptions_user").on(table.userId)]
);

// One delivery claim per item occurrence and child account. Recurring events
// share one event row, so their occurrence date is part of the identity.
export const pushReminderDeliveries = pgTable(
  "push_reminder_deliveries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceType: text("source_type").notNull(),
    sourceId: uuid("source_id").notNull(),
    occurrenceDate: date("occurrence_date").notNull(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    claimedAt: timestamp("claimed_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("idx_push_reminder_delivery_unique").on(table.sourceType, table.sourceId, table.occurrenceDate, table.userId)]
);
