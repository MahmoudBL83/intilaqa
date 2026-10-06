import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function EmployeeDocumentsRedirect({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/employee/document-wallet`);
}
