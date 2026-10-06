"use client";

import Link from "next/link";
import { cn } from "../../lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
};

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/50 mb-3">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-on-surface-variant/30">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-primary transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-primary/70">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-[40px] font-bold text-on-surface tracking-[-0.04em] leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-on-surface-variant/60 text-body-md mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}
