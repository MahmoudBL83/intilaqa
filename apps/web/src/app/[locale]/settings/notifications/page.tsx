import { auth } from '@intilaqa/auth';
import { redirect } from "next/navigation";
import NotificationSettingsContent from "./notifications-content";

export async function generateMetadata() {
  return {
    title: "Notification Settings | Intilaqa HRMS",
    description: "Manage your notification preferences",
  };
}

export default async function NotificationSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <NotificationSettingsContent />
    </div>
  );
}
