import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getVapidPublicKey } from "@/lib/push";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    return NextResponse.json({ publicKey: getVapidPublicKey() });
  } catch {
    return NextResponse.json({ error: "Push notifications are not configured" }, { status: 503 });
  }
}