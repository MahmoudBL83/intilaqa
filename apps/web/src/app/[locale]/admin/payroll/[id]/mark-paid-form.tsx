import { getTranslations } from "next-intl/server";
import { markPayrollAsPaid } from "../actions";

export async function MarkPaidForm({ recordId, locale }: { recordId: string; locale: string }) {
  const t = await getTranslations("payroll");
  return (
    <form
      action={async () => {
        "use server";
        await markPayrollAsPaid(recordId, locale);
      }}
    >
      <button
        type="submit"
        className="px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
      >
        {t("markAsPaid")}
      </button>
    </form>
  );
}
