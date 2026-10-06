import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { NotificationsPageContent } from "@/components/notifications-page-content";

export default async function ClientNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  return <NotificationsPageContent locale={locale} />;
}
