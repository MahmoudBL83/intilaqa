export const APP_SETTINGS_DEFAULTS = {
  appArabicName: "انطلاقة",
  appEnglishName: "Intilaqa",
  logoUrl: null as string | null,
  primaryColor: "#3a6758",
  defaultLanguage: "ar" as "ar" | "en",
} as const;

export type AppSettings = {
  appArabicName: string;
  appEnglishName: string;
  logoUrl: string | null;
  primaryColor: string;
  defaultLanguage: "ar" | "en";
};

export function getAppName(language: "ar" | "en"): string {
  return language === "ar"
    ? APP_SETTINGS_DEFAULTS.appArabicName
    : APP_SETTINGS_DEFAULTS.appEnglishName;
}
