-- AlterTable: Add bilingual notification fields and AppSettings currency/timezone
ALTER TABLE "Notification" ADD COLUMN "titleAr" TEXT,
ADD COLUMN "titleEn" TEXT,
ADD COLUMN "messageAr" TEXT,
ADD COLUMN "messageEn" TEXT;

ALTER TABLE "AppSettings" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'SAR',
ADD COLUMN "currencySymbol" TEXT NOT NULL DEFAULT 'SAR',
ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Asia/Riyadh',
ADD COLUMN "dateFormat" TEXT NOT NULL DEFAULT 'dd/MM/yyyy';
