"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Bell, CheckCheck, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader, LoadingState, EmptyState } from "@intilaqa/ui";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

const PAGE_SIZE = 10;

function timeAgo(dateStr: string, t: ReturnType<typeof useTranslations>): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("justNow");
  if (mins < 60) return t("minutesAgo", { minutes: mins } as any);
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t("hoursAgo", { hours: hrs } as any);
  const days = Math.floor(hrs / 24);
  return t("daysAgo", { days } as any);
}

export function NotificationsPageContent({ locale }: { locale: string }) {
  const t = useTranslations("notifications");
  const tc = useTranslations("common");
  const isRtl = locale === "ar";

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const skip = (p - 1) * PAGE_SIZE;
      const res = await fetch(`/api/notifications?take=${PAGE_SIZE}&skip=${skip}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
      setTotal(data.total || 0);
    } catch {/* ignore */}
    setLoading(false);
  }, []);

  useEffect(() => { fetchPage(page); }, [page, fetchPage]);

  async function handleMarkAllRead() {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function handleMarkRead(id: string) {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markRead", notificationId: id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const typeColors: Record<string, string> = {
    info: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    approval: "bg-success/10 text-success",
    rejection: "bg-error/10 text-error",
    alert: "bg-error/10 text-error",
  };

  return (
    <div>
      <PageHeader
        title={t("title")}
        breadcrumbs={[{ label: t("title") }]}
      />

      {notifications.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-primary hover:bg-primary/10 transition-all"
          >
            <CheckCheck className="w-4 h-4" />
            {t("markAllRead")}
          </button>
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell />}
          title={t("noData")}
          description={t("empty")}
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => { if (!n.read) handleMarkRead(n.id); }}
              className={`floating-glass rounded-2xl p-4 flex items-start gap-4 cursor-pointer transition-all ${
                !n.read ? "bg-primary/5 border-primary/20" : ""
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                typeColors[n.type] || "bg-on-surface-variant/10 text-on-surface-variant"
              }`}>
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h3 className={`text-[14px] ${!n.read ? "font-bold" : "font-medium"} text-on-surface`}>
                    {n.title}
                  </h3>
                  <span className="text-[11px] text-on-surface-variant/40 whitespace-nowrap shrink-0">
                    {timeAgo(n.createdAt, t)}
                  </span>
                </div>
                <p className="text-[13px] text-on-surface-variant/70 mt-1">{n.message}</p>
              </div>
              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <span className="text-on-surface-variant/60 text-[13px] font-medium">
            {tc("page")} {page} {tc("of")} {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-9 h-9 rounded-xl bg-white/30 border border-outline-variant/40 flex items-center justify-center hover:bg-white/50 transition-all disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 text-on-surface" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="w-9 h-9 rounded-xl bg-white/30 border border-outline-variant/40 flex items-center justify-center hover:bg-white/50 transition-all disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4 text-on-surface" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
