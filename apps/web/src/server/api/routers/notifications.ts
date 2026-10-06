import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import * as notificationService from "../../services/notification-service";

export const notificationsRouter = router({
  list: protectedProcedure
    .input(z.object({ take: z.number().optional(), skip: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user!.id!;
      return notificationService.getNotifications(userId, input.take, input.skip);
    }),

  unreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user!.id!;
      return notificationService.getUnreadCount(userId);
    }),

  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user!.id!;
      return notificationService.markAsRead(input.notificationId, userId);
    }),

  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.user!.id!;
      return notificationService.markAllAsRead(userId);
    }),
});
