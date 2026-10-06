import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { BiometricContent } from "./biometric-content";

export default async function CompanyBiometricPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  return <BiometricContent />;
}
