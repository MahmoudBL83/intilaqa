"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ClipboardList, AlertTriangle, Clock, CheckCircle2, User, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

type TaskData = {
  id: string;
  title: string;
  employeeName: string;
  dueDate: string;
  priority: string;
  status: string;
};

const priorityConfig: Record<string, { color: string; bg: string; text: string; icon: React.ElementType }> = {
  low: { color: "from-gray-400 to-gray-500", bg: "bg-gray-50", text: "text-gray-700", icon: Clock },
  medium: { color: "from-blue-400 to-blue-600", bg: "bg-blue-50", text: "text-blue-700", icon: Clock },
  high: { color: "from-orange-400 to-orange-600", bg: "bg-orange-50", text: "text-orange-700", icon: AlertTriangle },
  urgent: { color: "from-red-400 to-red-600", bg: "bg-red-50", text: "text-red-700", icon: AlertTriangle },
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  todo: { bg: "bg-gray-50", text: "text-gray-700" },
  in_progress: { bg: "bg-blue-50", text: "text-blue-700" },
  done: { bg: "bg-emerald-50", text: "text-emerald-700" },
};

function TaskCard({ task, locale }: { task: TaskData; locale: string }) {
  const t = useTranslations("tasks");
  const priorityCfg = priorityConfig[task.priority] as typeof priorityConfig[string] ?? priorityConfig.medium;
  const statusCfg = statusConfig[task.status] as typeof statusConfig[string] ?? statusConfig.todo;
  const PriorityIcon = priorityCfg.icon;

  return (
    <Link href={`/${locale}/admin/tasks/${task.id}`}>
      <div className="group relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
        <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${priorityCfg.color}`} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-[14px] font-bold text-on-surface leading-tight flex-1 min-w-0 truncate pr-2">{task.title}</h3>
            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusCfg.bg} ${statusCfg.text}`}>
              {t(task.status as "todo" | "in_progress" | "done")}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${priorityCfg.bg} ${priorityCfg.text}`}>
              <PriorityIcon className="w-3 h-3" />
              {t(task.priority as "low" | "medium" | "high" | "urgent")}
            </span>
          </div>

          <div className="flex items-center justify-between text-[12px] text-on-surface-variant/50 pt-3 border-t border-on-surface-variant/10">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{task.employeeName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{task.dueDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function TasksContent({
  tasks,
  total,
  locale,
  page,
  totalPages,
  queryString,
  emptyTitle,
  emptyDescription,
}: {
  tasks: TaskData[];
  total: number;
  locale: string;
  page: number;
  totalPages: number;
  queryString: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const t = useTranslations("tasks");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700/70 mb-1">{t("todo")}</p>
              <p className="text-3xl font-bold text-blue-900">{todoCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-200/50 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700/70 mb-1">{t("inProgress")}</p>
              <p className="text-3xl font-bold text-orange-900">{inProgressCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-200/50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700/70 mb-1">{t("done")}</p>
              <p className="text-3xl font-bold text-emerald-900">{doneCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-200/50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-16 h-16 text-on-surface-variant/15 mx-auto mb-4" />
          <p className="text-[16px] font-bold text-on-surface mb-1">{emptyTitle}</p>
          <p className="text-[13px] text-on-surface-variant/50">{emptyDescription}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} locale={locale} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 mt-8 floating-glass rounded-[2rem]">
          <span className="text-on-surface-variant/60 text-[13px] font-medium">
            {tc("page")} {page} {tc("of")} {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <a href={`?${[queryString, `page=${page - 1}`].filter(Boolean).join("&")}`} className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center hover:bg-white/50 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </a>
            ) : (
              <span className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </span>
            )}
            {page < totalPages ? (
              <a href={`?${[queryString, `page=${page + 1}`].filter(Boolean).join("&")}`} className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center hover:bg-white/50 transition-all">
                <ChevronRight className="w-4 h-4" />
              </a>
            ) : (
              <span className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center opacity-30">
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
