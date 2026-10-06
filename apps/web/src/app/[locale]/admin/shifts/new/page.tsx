import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { createShiftAction } from "../actions";
import { NewShiftForm } from "./new-shift-form";

export default async function NewShiftPage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("shifts");
  const commonT = await getTranslations("common");
  const dashboardT = await getTranslations("dashboard");

  const companies = await prisma.company.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader
        title={t("newShift")}
        breadcrumbs={[
          { label: dashboardT("overview"), href: `/${locale}/admin` },
          { label: t("title"), href: `/${locale}/admin/shifts` },
          { label: t("newShift") },
        ]}
      />
      <div className="max-w-3xl">
        <form action={createShiftAction}>
          <input type="hidden" name="locale" value={locale} />
          <NewShiftForm companies={companies} locale={locale} />
        </form>
      </div>
    </div>
  );
}
