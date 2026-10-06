import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { getAuditLogs } from "@/server/services/audit-service";
import { AdminAuditContent } from "./audit-content";

const PAGE_SIZE = 50;

export default async function AdminAuditLogPage(props: { searchParams: Promise<{ page?: string }>, params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));

  const { data, total } = await getAuditLogs({
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });

  return (
    <AdminAuditContent
      logs={data.map((l) => ({
        id: l.id,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        user: l.user?.name || "System",
        changes: l.changes ? JSON.stringify(l.changes) : null,
        ip: l.ip,
        createdAt: l.createdAt.toISOString(),
      }))}
      total={total}
      currentPage={page}
      totalPages={Math.ceil(total / PAGE_SIZE)}
    />
  );
}
