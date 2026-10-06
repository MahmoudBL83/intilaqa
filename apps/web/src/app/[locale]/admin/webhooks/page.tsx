import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { WebhooksContent } from "./webhooks-content";

const PAGE_SIZE = 20;

export default async function AdminWebhooksPage(props: { searchParams: Promise<{ page?: string }>, params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));

  const [webhooks, total] = await Promise.all([
    prisma.webhookRegistry.findMany({
      include: { deliveries: { orderBy: { createdAt: "desc" }, take: 5 } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.webhookRegistry.count(),
  ]);

  return (
    <WebhooksContent
      webhooks={webhooks.map((w) => ({
        id: w.id,
        name: w.name,
        url: w.url,
        events: w.events,
        isActive: w.isActive,
        deliveries: w.deliveries.map((d) => ({
          eventType: d.eventType,
          success: d.success,
          responseCode: d.responseCode,
          createdAt: d.createdAt.toISOString(),
        })),
      }))}
      currentPage={page}
      totalPages={Math.ceil(total / PAGE_SIZE)}
    />
  );
}
