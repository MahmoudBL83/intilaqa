"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
}

export function Pagination({ currentPage, totalPages, siblingCount = 1 }: PaginationProps) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages: (number | "...")[] = [];
  const start = Math.max(2, currentPage - siblingCount);
  const end = Math.min(totalPages - 1, currentPage + siblingCount);

  pages.push(1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 mt-6" aria-label="Pagination">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="floating-glass px-3 py-1.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        {t("previous")}
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 py-1.5 text-sm text-foreground/40">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goToPage(p)}
            className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
              p === currentPage
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "floating-glass text-foreground/70 hover:text-foreground"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="floating-glass px-3 py-1.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        {t("next")}
      </button>
    </nav>
  );
}
