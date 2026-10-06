"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Bell, HelpCircle, User, LogOut, Languages, ChevronDown, CheckCheck, Loader2 } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { cn } from "../../lib/utils";

type TopbarProps = {
  onMenuToggle?: () => void;
  basePath?: string;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
};

const POLL_INTERVAL = 30000;

function timeAgo(dateStr: string, t: ReturnType<typeof useTranslations>): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("justNow");
  if (mins < 60) return t("minutesAgo", { mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t("hoursAgo", { hrs });
  const days = Math.floor(hrs / 24);
  return t("daysAgo", { days });
}

export function Topbar({ onMenuToggle, basePath = "" }: TopbarProps) {
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations("roles");
  const commonT = useTranslations("common");
  const notifT = useTranslations("notifications");
  const isRtl = locale === "ar";

  const role = (session?.user as { role?: string })?.role || "admin";
  const userId = (session?.user as { id?: string })?.id;
  const userName = session?.user?.name || "Admin User";
  const userEmail = session?.user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const roleLabelKey =
    role === "admin" ? "admin"
    : role === "client" ? "client"
    : role === "company_admin" ? "companyAdmin"
    : role === "employee" ? "employee"
    : "unknown";
  const roleLabel = t(roleLabelKey);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filterType, setFilterType] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);

  const baseRolePath = basePath || `/${role.replace("_", "-")}`;

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setTotalCount(data.total || 0);
    } catch {/* ignore */}
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkAllRead() {
    setMarking(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {/* ignore */}
    setMarking(false);
  }

  async function handleMarkRead(notificationId: string) {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", notificationId }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {/* ignore */}
  }

  function handleSignOut() {
    signOut({ callbackUrl: `/${locale}/login` });
  }

  function toggleLanguage() {
    const newLocale = locale === "ar" ? "en" : "ar";
    const rest = window.location.pathname.replace(/^\/(ar|en)/, "");
    window.location.href = `/${newLocale}${rest}${window.location.search}`;
  }

  const typeColors: Record<string, string> = {
    info: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    approval: "bg-success/10 text-success",
    rejection: "bg-error/10 text-error",
    alert: "bg-error/10 text-error",
  };

  const notifFilterLabels: Record<string, string> = {
    all: commonT("all"),
    attendance: notifT("types.attendance"),
    payroll: notifT("types.payroll"),
    compliance: notifT("types.compliance"),
    request: notifT("types.request"),
    loan: notifT("types.loan"),
  };

  return (
    <header className="sticky top-0 w-full z-30 bg-white/20 backdrop-blur-3xl border-b border-white/40 flex justify-between items-center h-[80px] px-8">
      <button onClick={onMenuToggle} className="md:hidden text-on-surface-variant p-2 hover:bg-white/30 rounded-full">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      <div className="flex-1 flex items-center max-w-lg hidden sm:flex bg-white/40 border border-white/60 focus-within:bg-white/70 focus-within:border-primary/30 rounded-2xl transition-all h-11 px-4">
        <Search className="w-5 h-5 text-on-surface-variant/40 shrink-0" />
        <input
          type="text"
          placeholder={commonT("searchPlaceholder")}
          className="w-full bg-transparent border-none focus:ring-0 text-[14px] text-on-surface placeholder-on-surface-variant/40 outline-none font-medium px-2"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-on-surface-variant/60 hover:text-on-surface hover:bg-white/30 transition-all text-[13px] font-bold"
        >
          <Languages className="w-5 h-5" />
          <span>{locale === "ar" ? "English" : "العربية"}</span>
        </button>

        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-on-surface-variant/60 hover:text-on-surface hover:bg-white/30 w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
          >
            <Bell className="w-[22px] h-[22px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -end-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[10px] font-bold leading-none shadow-lg">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div
              className={cn(
                "absolute top-full mt-2 w-[360px] bg-white/90 backdrop-blur-3xl border border-white/60 rounded-2xl shadow-xl z-50 overflow-hidden",
                isRtl ? "left-0" : "right-0"
              )}
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-white/30">
                <h3 className="text-[14px] font-bold text-on-surface">{notifT("title")}</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    disabled={marking}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary/70 transition-all disabled:opacity-50"
                  >
                    {marking ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCheck className="w-3.5 h-3.5" />
                    )}
                    {notifT("markAllRead")}
                  </button>
                )}
              </div>

              <div className="flex gap-1 px-3 py-2 border-b border-white/20 overflow-x-auto">
                {["all", "attendance", "payroll", "compliance", "request", "loan"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterType(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap transition-all ${filterType === cat ? "bg-primary text-white" : "bg-white/30 text-on-surface-variant/60 hover:bg-white/50"}`}
                  >
                    {notifFilterLabels[cat] || cat}
                  </button>
                ))}
              </div>

              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-[13px] text-on-surface-variant/60 font-medium text-center py-10">
                    {notifT("empty")}
                  </p>
                ) : (
                  notifications.filter((n) => filterType === "all" || n.type.includes(filterType)).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (!n.read) handleMarkRead(n.id);
                      }}
                      className={cn(
                        "w-full text-start px-5 py-3 border-b border-white/20 hover:bg-white/40 transition-all flex items-start gap-3",
                        !n.read && "bg-primary/5"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        typeColors[n.type] || "bg-on-surface-variant/10 text-on-surface-variant"
                      )}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className={cn(
                            "text-[13px] leading-tight",
                            !n.read ? "font-bold text-on-surface" : "font-medium text-on-surface-variant/80"
                          )}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-on-surface-variant/40 whitespace-nowrap shrink-0 mt-0.5">
                            {timeAgo(n.createdAt, commonT)}
                          </span>
                        </div>
                        <p className="text-[12px] text-on-surface-variant/60 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {totalCount > 5 && (
                <Link
                  href={`/${locale}${baseRolePath}/notifications`}
                  onClick={() => setNotifOpen(false)}
                  className="block text-center text-[12px] font-bold text-primary py-3 hover:bg-white/40 transition-all border-t border-white/30"
                >
                  {commonT("viewAll", { count: totalCount })}
                </Link>
              )}
            </div>
          )}
        </div>

        <button className="text-on-surface-variant/60 hover:text-on-surface hover:bg-white/30 w-10 h-10 rounded-2xl flex items-center justify-center transition-all">
          <HelpCircle className="w-[22px] h-[22px]" />
        </button>

        <div className="h-8 w-px bg-white/40 mx-2 hidden sm:block" />

        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 hover:bg-white/30 rounded-2xl p-1.5 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-[13px] border border-white/30">
              {userInitial}
            </div>
            <div className="hidden lg:flex flex-col items-start pe-2">
              <span className="font-bold text-on-surface text-[13px] tracking-tight">{userName}</span>
              <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider">
                {roleLabel}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-on-surface-variant/40 hidden lg:block" />
          </button>

          {profileOpen && (
            <div
              className={cn(
                "absolute top-full mt-2 w-56 bg-white/80 backdrop-blur-3xl border border-white/60 rounded-2xl shadow-xl z-50 overflow-hidden",
                isRtl ? "left-0" : "right-0"
              )}
            >
              <div className="p-4 border-b border-white/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-[14px] border border-white/30">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-on-surface text-[13px] truncate">{userName}</p>
                    <p className="text-[11px] text-on-surface-variant/50 truncate">{userEmail}</p>
                  </div>
                </div>
              </div>

              <Link
                href={`/${locale}/admin/settings`}
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-on-surface hover:bg-white/40 transition-all"
              >
                <User className="w-4 h-4 text-on-surface-variant/50" />
                {commonT("profile")}
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-error hover:bg-error/10 transition-all border-t border-white/20"
              >
                <LogOut className="w-4 h-4" />
                {commonT("logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
