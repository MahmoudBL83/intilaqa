"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";

type Client = { id: string; name: string };
type Company = { id: string; name: string; clientName?: string };

export function AdminFilterBar({
  clients,
  companies,
  currentClient,
  currentCompany,
  locale,
}: {
  clients: Client[];
  companies: Company[];
  currentClient?: string;
  currentCompany?: string;
  locale: string;
}) {
  const t = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleFilter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const client = fd.get("client") as string;
    const company = fd.get("company") as string;
    const search = fd.get("search") as string;
    if (client) params.set("client", client);
    if (company) params.set("company", company);
    if (search) params.set("search", search);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  function clearFilters() {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    router.push(`?${params.toString()}`);
  }

  const hasFilters = !!(currentClient || currentCompany);

  return (
    <form onSubmit={handleFilter} className="mb-6 flex flex-wrap gap-3 items-end">
      <select
        name="client"
        defaultValue={currentClient || ""}
        className="bg-white/40 border border-outline-variant/60 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none font-medium min-w-[160px]"
      >
        <option value="">{t("all")} {t("clients")}</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select
        name="company"
        defaultValue={currentCompany || ""}
        className="bg-white/40 border border-outline-variant/60 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none font-medium min-w-[180px]"
      >
        <option value="">{t("all")} {t("companies")}</option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>{c.name}{c.clientName ? ` (${c.clientName})` : ""}</option>
        ))}
      </select>

      <div className="flex items-center bg-white/40 border border-outline-variant/60 focus-within:bg-white/70 focus-within:border-primary/30 rounded-2xl h-11 px-4 transition-all min-w-[200px] flex-1">
        <Search className="w-4 h-4 text-on-surface-variant/40 shrink-0" />
        <input
          name="search"
          defaultValue={searchParams.get("search") || ""}
          placeholder={`${t("search")}...`}
          className="w-full bg-transparent border-none focus:ring-0 text-[14px] text-on-surface placeholder-on-surface-variant/40 outline-none font-medium px-2"
        />
      </div>

      <button
        type="submit"
        className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold hover:scale-[1.02] transition-all"
      >
        {t("search")}
      </button>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="px-4 py-2.5 rounded-2xl bg-white/30 border border-white/40 text-on-surface-variant/60 text-[13px] font-medium hover:bg-white/50 transition-all flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" />
          {t("clear")}
        </button>
      )}
    </form>
  );
}
