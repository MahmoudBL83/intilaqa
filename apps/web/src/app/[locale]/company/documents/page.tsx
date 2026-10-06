import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function CompanyDocumentsRedirect({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/company/compliance`);
}
