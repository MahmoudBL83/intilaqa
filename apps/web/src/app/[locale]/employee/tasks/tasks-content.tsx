"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { PageHeader, KPICard, StatusBadge } from "@intilaqa/ui";
import { ClipboardList, CheckCircle, Clock, Loader2 } from "lucide-react";

type Task = { id: string; title: string; priority: string; status: string; dueDate: string | null };
const priorityColors: Record<string, string> = { low: "bg-gray-100 text-gray-700", medium: "bg-blue-100 text-blue-700", high: "bg-orange-100 text-orange-700", urgent: "bg-red-100 text-red-700" };

export function TasksContent({ tasks, locale }: { tasks: Task[]; locale: string }) {
  const t = useTranslations("tasks");
  const td = useTranslations("dashboard");
  const tn = useTranslations("nav");
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  const todo = tasks.filter((tk) => tk.status === "todo").length;
  const done = tasks.filter((tk) => tk.status === "done").length;

  async function updateStatus(taskId: string, newStatus: string) {
    setUpdating(taskId);
    try {
      await fetch(`/api/v1/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch {} finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <PageHeader title={td("myTasks")} breadcrumbs={[{ label: tn("items.dashboard"), href: `/${locale}/employee` }, { label: td("myTasks") }]} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KPICard title={td("total")} value={tasks.length} icon={<ClipboardList className="w-5 h-5" />} color="blue" />
        <KPICard title={t("todo")} value={todo} icon={<Clock className="w-5 h-5" />} color="yellow" />
        <KPICard title={t("done")} value={done} icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
      </div>
      <div className="floating-glass rounded-[2rem] p-6">
        {tasks.length === 0 ? (
          <div className="py-12 text-center"><ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">{t("noTasksAssigned")}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("title")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("priority")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("dueDate")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("status")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("actions")}</th>
              </tr></thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-3 py-3 font-medium text-[13px]">{task.title}</td>
                    <td className="px-3 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityColors[task.priority] || priorityColors.medium}`}>{task.priority}</span></td>
                    <td className="px-3 py-3 text-center text-[12px] text-gray-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</td>
                    <td className="px-3 py-3 text-center"><StatusBadge status={task.status} /></td>
                    <td className="px-3 py-3 text-center">
                      {task.status !== "done" && (
                        <select
                          value={task.status}
                          onChange={(e) => updateStatus(task.id, e.target.value)}
                          disabled={updating === task.id}
                          className="bg-transparent border border-outline-variant/40 rounded-lg px-2 py-1 text-[11px] font-bold text-on-surface focus:border-primary focus:outline-none"
                        >
                          <option value="todo">{t("todo")}</option>
                          <option value="in_progress">{t("inProgress")}</option>
                          <option value="done">{t("done")}</option>
                        </select>
                      )}
                      {updating === task.id && <Loader2 className="w-3 h-3 animate-spin inline ml-1" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
