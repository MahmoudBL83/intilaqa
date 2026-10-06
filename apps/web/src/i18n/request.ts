import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";

const localeMessages: Record<string, () => Promise<AbstractIntlMessages>> = {
  en: () => import("@intilaqa/i18n/messages/en").then((m) => m.default),
  ar: () => import("@intilaqa/i18n/messages/ar").then((m) => m.default),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (requested === "en" || requested === "ar") ? (requested as "ar" | "en") : "ar";

  const loadMessages = localeMessages[locale]!;

  return {
    locale,
    messages: await loadMessages(),
  };
});
