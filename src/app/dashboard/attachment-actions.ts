"use server";

import { db } from "@/lib/db";
import { attachments } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { getAttachmentsForItem } from "@/lib/queries";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { canAccessAttachment, canAccessContent } from "@/lib/access";

type AttachmentParentType = "schedule_item" | "event" | "comment";

export async function addAttachmentUrl(
  parentType: AttachmentParentType,
  parentId: string,
  url: string,
  fileName: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }
  if (!await canAccessContent(session.user, parentType, parentId)) {
    return { error: "Not authorised" };
  }

  let trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return { error: "URL is required" };
  }

  if (!/^https?:\/\//i.test(trimmedUrl)) {
    trimmedUrl = `https://${trimmedUrl}`;
  }

  try {
    const parsed = new URL(trimmedUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { error: "Only HTTP and HTTPS URLs are allowed" };
    }
  } catch {
    return { error: "Invalid URL" };
  }

  // Determine file type from URL
  const fileType = getFileType(trimmedUrl);

  await db.insert(attachments).values({
    parentType,
    parentId,
    fileUrl: trimmedUrl,
    fileType,
    fileName: fileName.trim() || trimmedUrl,
    fileSize: 0,
    uploadedBy: session.user.id,
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteAttachment(attachmentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const [attachment] = await db
    .select()
    .from(attachments)
    .where(eq(attachments.id, attachmentId))
    .limit(1);

  if (!attachment) {
    return { error: "Attachment not found" };
  }
  if (!await canAccessAttachment(session.user, attachmentId)) {
    return { error: "Not authorised" };
  }

  // Authorization check: user must be the uploader or a parent in the family
  if (attachment.uploadedBy !== session.user.id && session.user.role !== "parent") {
    return { error: "Unauthorized" };
  }

  await db.delete(attachments).where(eq(attachments.id, attachmentId));

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { ok: true };
}

export async function getAttachments(
  parentType: AttachmentParentType,
  parentId: string
) {
  const session = await auth();
  if (!session?.user?.id || !await canAccessContent(session.user, parentType, parentId)) {
    return [];
  }
  return getAttachmentsForItem(parentType, parentId);
}

function getFileType(url: string): string {
  if (isYouTubeUrl(url)) {
    return "youtube";
  }

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    const search = parsed.search.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();

    const ext = pathname.split(".").pop() ?? "";

    if (["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"].includes(ext)) {
      return `image/${ext === "jpg" ? "jpeg" : ext}`;
    }

    if (
      hostname.includes("images.unsplash.com") ||
      hostname.includes("imgur.com") ||
      hostname.includes("giphy.com") ||
      hostname.includes("pixabay.com") ||
      hostname.includes("cloudinary.com") ||
      pathname.includes("/photo-")
    ) {
      return "image/jpeg";
    }

    if (
      search.includes("format=") ||
      search.includes("fm=jpg") ||
      search.includes("fm=png") ||
      search.includes("fm=webp")
    ) {
      return "image/jpeg";
    }

    if (ext === "pdf") return "application/pdf";
    if (ext === "docx") {
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
    if (ext === "doc") return "application/msword";
  } catch {
    // Invalid URL — fall through to generic link
  }

  return "text/uri-list";
}

function isYouTubeUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtu.be" ||
      hostname === "www.youtu.be"
    );
  } catch {
    return false;
  }
}
