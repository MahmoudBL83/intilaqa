import { prisma } from "@intilaqa/db";

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  titleAr?: string;
  titleEn?: string;
  messageAr?: string;
  messageEn?: string;
  type: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({ data: input });
}

export async function createNotificationForRole(
  role: string,
  input: Omit<CreateNotificationInput, "userId">
) {
  const users = await prisma.user.findMany({
    where: { role, isActive: true },
    select: { id: true },
  });
  return Promise.all(
    users.map((u) =>
      prisma.notification.create({ data: { ...input, userId: u.id } })
    )
  );
}

export async function getNotifications(userId: string, take = 10, skip = 0) {
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { notifications, total };
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
