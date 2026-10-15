export type UserRole = "parent" | "child";

export type ItemStatus = "pending" | "in_progress" | "done" | "skipped";

export type ItemCategory =
  | "routine"
  | "hygiene"
  | "meal"
  | "school"
  | "activity"
  | "social"
  | "appointment"
  | "chore"
  | "free_time"
  | "other";

export type AttachmentParentType = "schedule_item" | "event" | "comment";
export type CommentParentType = "schedule_item" | "event";

export interface Family {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  family_id: string;
  role: UserRole;
  display_name: string;
  email: string;
  avatar_url: string | null;
  notification_prefs: NotificationPrefs;
  low_stim_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPrefs {
  email_digest: boolean;
  push_enabled: boolean;
  daily_lookahead: boolean;
  weekly_summary: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export interface Child {
  id: string;
  family_id: string;
  profile_id: string | null;
  display_name: string;
  avatar_url: string | null;
  date_of_birth: string | null;
  consent_given_at: string;
  consent_given_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoutineTemplate {
  id: string;
  child_id: string;
  day_of_week: number;
  recurrence_rule: string;
  anchor_date: string | null;
  start_time: string;
  end_time: string;
  title: string;
  description: string | null;
  category: ItemCategory;
  sort_order: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduleItem {
  id: string;
  child_id: string;
  date: string;
  start_time: string;
  end_time: string | null;
  title: string;
  description: string | null;
  category: ItemCategory;
  status: ItemStatus;
  template_id: string | null;
  created_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  location?: string | null;
  is_event?: boolean;
}

export interface Event {
  id: string;
  child_id: string;
  date: string;
  start_time: string;
  end_time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  category: ItemCategory;
  recurrence_rule: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  parent_type: CommentParentType;
  parent_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  parentType: AttachmentParentType;
  parentId: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string | null;
  createdAt: Date;
}

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  routine: "Routine",
  hygiene: "Hygiene",
  meal: "Meal",
  school: "School",
  activity: "Activity",
  social: "Social",
  appointment: "Appointment",
  chore: "Chore",
  free_time: "Free Time",
  other: "Other",
};

export const CATEGORY_EMOJI: Record<ItemCategory, string> = {
  routine: "📋",
  hygiene: "🪥",
  meal: "🍽️",
  school: "📚",
  activity: "⚽",
  social: "👋",
  appointment: "🏥",
  chore: "🧹",
  free_time: "🎮",
  other: "📌",
};

export const STATUS_LABELS: Record<ItemStatus, string> = {
  pending: "Upcoming",
  in_progress: "Now",
  done: "Done",
  skipped: "Skipped",
};
