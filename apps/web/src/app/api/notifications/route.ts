import { NextRequest, NextResponse } from "next/server";
import { auth } from "@intilaqa/auth";
import * as notificationService from "@/server/services/notification-service";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const take = parseInt(searchParams.get("take") || "5");
  const skip = parseInt(searchParams.get("skip") || "0");

  const [notifData, unreadCount] = await Promise.all([
    notificationService.getNotifications(userId, take, skip),
    notificationService.getUnreadCount(userId),
  ]);

  return NextResponse.json({ notifications: notifData.notifications, total: notifData.total, unreadCount });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { action, notificationId } = body;

  if (action === "markAllRead") {
    await notificationService.markAllAsRead(userId);
  } else if (action === "markRead" && notificationId) {
    await notificationService.markAsRead(notificationId, userId);
  }

  return NextResponse.json({ success: true });
}
