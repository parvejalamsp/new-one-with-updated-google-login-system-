import { Clock3 } from "lucide-react";
import { AppContent, AppShell } from "@/components/AppWorkspace";

export default function UnavailableFeature() {
  return <><AppShell title="Recurring billing"><></></AppShell><AppContent title="Recurring billing" eyebrow="Not available yet"><section className="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm sm:p-12" data-testid="recurring-unavailable-state"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600"><Clock3 className="size-6" /></span><h2 className="mt-5 font-heading text-2xl font-bold">Recurring billing is not connected.</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">This MVP does not create recurring invoices or send automatic reminders. The previous browser-only schedule demo remains untouched in localStorage but is no longer used as a business record.</p></section></AppContent></>;
}