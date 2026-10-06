import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { ApiKeysContent } from "./api-keys-content";

const PAGE_SIZE = 20;

export default async function AdminApiKeysPage(props: { searchParams: Promise<{ page?: string }>, params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));

  const [keys, total] = await Promise.all([
    prisma.apiKey.findMany({
      include: { client: { select: { name: true } }, company: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.apiKey.count(),
  ]);

  return (
    <ApiKeysContent
      keys={keys.map((k) => ({
        id: k.id,
        name: k.name,
        prefix: k.prefix,
        clientName: k.client?.name || null,
        companyName: k.company?.name || null,
        permissions: k.permissions,
        isActive: k.isActive,
        lastUsedAt: k.lastUsedAt?.toISOString() || null,
        expiresAt: k.expiresAt?.toISOString() || null,
      }))}
      currentPage={page}
      totalPages={Math.ceil(total / PAGE_SIZE)}
    />
  );
}
