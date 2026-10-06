import { redirect } from "next/navigation";
import { auth } from "@intilaqa/auth";
import { getDashboardRoute } from "@intilaqa/auth";
import type { Role } from "@intilaqa/shared";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const role = ((session.user as { role?: string }).role || "employee") as Role;
  redirect(getDashboardRoute(role));
}
