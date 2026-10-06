"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "../../lib/utils";
import { AppBrand } from "../AppBrand";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  ShieldAlert,
  Shield,
  AlertTriangle,
  Key,
  CreditCard,
  CalendarCheck,
  Clock,
  Timer,
  FileText,
  FileCheck,
  DollarSign,
  ReceiptText,
  ClipboardList,
  BarChart3,
  Settings,
  Palette,
  UserCog,
  Bell,
  Globe,
  Plus,
  ChevronLeft,
  X,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  iconName: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export type SidebarProps = {
  navigations: NavGroup[];
  basePath: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  ShieldAlert,
  Shield,
  Key,
  CreditCard,
  CalendarCheck,
  Clock,
  Timer,
  FileText,
  FileCheck,
  DollarSign,
  ReceiptText,
  ClipboardList,
  BarChart3,
  Settings,
  Palette,
  UserCog,
  Bell,
  Globe,
  AlertTriangle,
};

export function Sidebar({
  navigations,
  basePath,
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav.items");
  const isRtl = locale === "ar";

  function isActive(href: string) {
    const fullPath = `/${locale}${basePath}${href}`;
    return pathname === fullPath || pathname.startsWith(fullPath + "/");
  }

  const sidebarEdge = isRtl ? "right-0" : "left-0";
  const sidebarBorder = isRtl ? "border-l" : "border-r";

  const sidebarContent = (
    <>
      <div className="h-[96px] flex items-center justify-between px-5">
        <div
          className={cn(
            "flex items-center gap-3 overflow-hidden",
            collapsed && "justify-center w-full"
          )}
        >
          <AppBrand collapsed={collapsed} />
        </div>
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className={cn(
            "hidden md:flex text-on-surface-variant/40 hover:text-on-surface p-2 rounded-xl hover:bg-white/20 transition-all shrink-0",
            collapsed && "absolute right-2"
          )}
        >
          <ChevronLeft
            className={cn(
              "w-5 h-5 transition-transform",
              collapsed && (isRtl ? "-rotate-180" : "rotate-180")
            )}
          />
        </button>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="md:hidden text-on-surface-variant/60 hover:text-on-surface p-2 rounded-xl hover:bg-white/30 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto px-5 space-y-8">
        {navigations.map((group, gi) => (
          <div key={gi}>
            {!collapsed && (
              <p className="px-3 mb-3 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.12em]">
                {group.title}
              </p>
            )}
            <ul className="space-y-1.5">
              {group.items.map((item, ii) => {
                const active = isActive(item.href);
                const IconComp = iconMap[item.iconName] || LayoutDashboard;
                return (
                  <li key={ii}>
                    <Link
                      href={hrefWithLocale(locale, basePath, item.href)}
                      onClick={onMobileClose}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-2xl relative group overflow-hidden transition-all",
                        active
                          ? "bg-primary/10 text-primary nav-item-active"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-white/30",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      <span className="shrink-0">
                        <IconComp className="w-5 h-5" />
                      </span>
                      {!collapsed && (
                        <span
                          className={cn(
                            "tracking-tight whitespace-nowrap",
                            active && "font-semibold"
                          )}
                        >
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-6">
        <button className="w-full bg-primary text-white py-3.5 px-4 rounded-2xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <Plus className="w-5 h-5 shrink-0" />
          {!collapsed && (
            <span className="whitespace-nowrap">{t("createNew")}</span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen overflow-hidden fixed top-0 z-40 bg-white/40 backdrop-blur-3xl text-on-surface font-medium border-white/30 transition-all duration-500 ease-in-out",
          sidebarEdge,
          sidebarBorder,
          collapsed ? "w-[88px]" : "w-[280px]"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "md:hidden flex-col h-screen overflow-hidden fixed top-0 z-40 bg-white/80 backdrop-blur-3xl text-on-surface font-medium border-white/30 transition-transform duration-500 ease-in-out",
          sidebarEdge,
          sidebarBorder,
          mobileOpen
            ? "translate-x-0 flex w-[280px]"
            : isRtl
              ? "translate-x-full flex w-[280px]"
              : "-translate-x-full flex w-[280px]"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

function hrefWithLocale(locale: string, basePath: string, href: string): string {
  const path = basePath + (href || "");
  return `/${locale}${path}`;
}
