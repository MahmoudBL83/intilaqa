import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { prisma } from "@intilaqa/db";
import "@intilaqa/config/tokens.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "انطلاقة | Intilaqa HRMS",
  description: "Human Resource Management System",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let lang = "ar";
  let dir = "rtl";
  try {
    const settings = await prisma.appSettings.findFirst();
    if (settings) {
      lang = settings.defaultLanguage;
      dir = lang === "ar" ? "rtl" : "ltr";
    }
  } catch {
    // fallback to defaults
  }

  return (
    <html lang={lang} dir={dir}>
      <body className={`${manrope.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
