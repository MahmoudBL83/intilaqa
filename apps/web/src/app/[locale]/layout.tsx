import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { getDirection, type Locale } from "@intilaqa/i18n";
import "./globals.css";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const dir = getDirection(locale as Locale);
  const isArabic = locale === "ar";

  return (
    <div lang={locale} dir={dir} className={isArabic ? "font-arabic" : ""}>
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}
