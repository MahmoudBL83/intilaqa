import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { BrandingForm } from "./branding-form";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("sidebar");

  let settings = await prisma.appSettings.findFirst();

  if (!settings) {
    settings = await prisma.appSettings.create({
      data: {
        appArabicName: "انطلاقة",
        appEnglishName: "Intilaqa",
        primaryColor: "#3a6758",
        defaultLanguage: "ar",
      },
    });
  }

  return (
    <div>
      <PageHeader
        title={t("settings")}
        breadcrumbs={[
          { label: t("dashboard"), href: `/${locale}/admin` },
          { label: t("settings") },
        ]}
      />

      <BrandingForm
        settings={{
          id: settings.id,
          appArabicName: settings.appArabicName,
          appEnglishName: settings.appEnglishName,
          logoUrl: settings.logoUrl,
          primaryColor: settings.primaryColor,
          defaultLanguage: settings.defaultLanguage,
        }}
      />
    </div>
  );
}
