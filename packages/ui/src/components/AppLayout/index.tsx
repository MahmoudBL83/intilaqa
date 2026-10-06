"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { SessionProvider } from "next-auth/react";
import { cn } from "../../lib/utils";
import { Sidebar, type NavGroup } from "../Sidebar";
import { Topbar } from "../Topbar";

type AppLayoutProps = {
  children: React.ReactNode;
  navigations: NavGroup[];
  basePath: string;
};

export function AppLayout({ children, navigations, basePath }: AppLayoutProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const marginClass = isRtl
    ? collapsed
      ? "md:mr-[88px]"
      : "md:mr-[280px]"
    : collapsed
      ? "md:ml-[88px]"
      : "md:ml-[280px]";

  return (
    <div
      className="bg-mesh text-on-background min-h-screen flex"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <SessionProvider>
        {/* Mobile overlay backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <Sidebar
          navigations={navigations}
          basePath={basePath}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div
          className={cn(
            "flex-1 flex flex-col min-h-screen transition-all duration-500",
            marginClass
          )}
        >
          <Topbar onMenuToggle={() => setMobileOpen(true)} basePath={basePath} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-12 overflow-y-auto">
            {children}
          </main>
        </div>
      </SessionProvider>
    </div>
  );
}
