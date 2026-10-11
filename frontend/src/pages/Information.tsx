import { useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { BookOpen, CheckCircle2, FileCode2, Landmark, LockKeyhole, Mail, Scale, ShieldCheck } from "lucide-react";
import { Footer, PublicNav } from "@/components/collectflow";

const pages = {
  "/about": { eyebrow: "About collectFlow", title: "Built for the people doing the follow-up.", intro: "collectFlow is an illustrative product demo for small Indian agencies that want a calmer way to see invoices, due dates, and collection priorities.", icon: Landmark, sections: [["Our focus", "A compact workspace that helps an owner or finance operator decide what needs attention next."], ["What this demo is", "A local-first experience using seeded sample data. It does not process payments, send reminders, or make compliance claims."], ["Design principle", "Clear status language, readable financial figures, and an obvious next action for every invoice."]] },
  "/security": { eyebrow: "Security", title: "Clear boundaries for a safe demo.", intro: "This phase keeps business data in your browser and avoids real payment, email, or reminder side effects.", icon: ShieldCheck, sections: [["Local demo data", "Seeded invoices and changes are stored in localStorage on this browser. They are not durable production records."], ["Authentication", "Login and signup are mocked for evaluation. Do not enter real credentials or customer information."], ["External services", "Payment, support, email, reminder, and export actions are labelled as demo or test-mode interactions."]] },
  "/contact": { eyebrow: "Contact", title: "Talk to the demo team.", intro: "Use this form to preview the support experience. It does not send an external message.", icon: Mail, sections: [["Response mode", "Submitting shows an on-screen demo confirmation with no external side effect."], ["For product feedback", "Describe the workflow you want to evaluate without including real client, payment, or credential data."]] },
  "/help": { eyebrow: "Help center", title: "Get oriented quickly.", intro: "A short guide to the current collectFlow demo workspace.", icon: BookOpen, sections: [["Start with priorities", "Open Invoices and filter paid, pending, due-soon, overdue, and draft work."], ["Create a draft", "Choose a sample client, add an amount and rate, review live totals, then save locally."], ["Reset expectations", "All reminders, payments, support, and exports remain mocked in this phase."]] },
  "/gst-resources": { eyebrow: "GST resources", title: "Planning fields, not tax advice.", intro: "collectFlow demonstrates common invoice fields such as GSTIN, HSN/SAC, tax rates, and tax splits.", icon: Scale, sections: [["Verify before use", "Tax treatment depends on your facts. Confirm rates, place of supply, and invoice requirements with a qualified adviser."], ["Calculator scope", "Calculator outputs are estimates based only on values and rates entered by the user."], ["No compliance claim", "The demo does not file returns, validate registrations, or certify invoice compliance."]] },
  "/api-docs": { eyebrow: "API docs", title: "A preview of future integration surfaces.", intro: "Production billing APIs are not enabled in this local-first phase.", icon: FileCode2, sections: [["Current availability", "No public business-data API is available. The backend status endpoint is only a connectivity probe."], ["Future direction", "Potential resources include clients, invoices, payments, schedules, and report exports after data ownership is defined."], ["No credentials required", "Do not enter or share API keys while evaluating this demo."]] },
  "/terms": { eyebrow: "Terms", title: "Demo terms of use.", intro: "Use collectFlow as an illustrative product experience, not as a system of record.", icon: CheckCircle2, sections: [["Demo content", "Figures, businesses, invoices, plans, and product metrics are fictional samples."], ["No financial action", "The app does not collect money, send communications, or submit tax data."], ["Your responsibility", "Do not enter real credentials, confidential customer data, or payment information."]] },
  "/privacy": { eyebrow: "Privacy", title: "What this demo stores.", intro: "The workspace is local-first and uses browser storage for the demo session and sample changes.", icon: LockKeyhole, sections: [["Browser storage", "Demo session, profile inputs, invoices, clients, schedules, and preferences may be stored locally on this device."], ["No production account", "Mock signup does not create a live user or send your password to an authentication provider."], ["Clear local data", "Clear this site's browser storage to remove local demo changes."]] },
} as const;

export default function Information() {
  const { pathname } = useLocation();
  const [sent, setSent] = useState(false);
  const page = pages[pathname as keyof typeof pages] ?? pages["/about"];
  const Icon = page.icon;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <PublicNav />
      <main className="px-4 pb-24 pt-36 sm:px-6 lg:pt-44">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-3xl">
            <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Icon className="size-6" /></span>
            <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-blue-600" data-testid="information-eyebrow">{page.eyebrow}</p>
            <h1 className="mt-4 font-heading text-4xl font-extrabold leading-tight tracking-[-.06em] text-slate-950 sm:text-6xl" data-testid="information-heading">{page.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500" data-testid="information-intro">{page.intro}</p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {page.sections.map(([title, text], index) => (
              <section key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-testid={`information-section-${index + 1}`}>
                <p className="font-heading text-lg font-bold text-slate-900">{title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-500">{text}</p>
              </section>
            ))}
          </div>
          {pathname === "/contact" && (
            <form onSubmit={submit} className="mt-10 rounded-2xl border border-blue-100 bg-blue-50/70 p-6 sm:p-8" data-testid="contact-demo-form">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">Name<input required className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" data-testid="contact-name-input" /></label>
                <label className="text-sm font-semibold text-slate-700">Email<input required type="email" className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" data-testid="contact-email-input" /></label>
                <label className="text-sm font-semibold text-slate-700 sm:col-span-2">What would you like to evaluate?<textarea required className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2" data-testid="contact-message-input" /></label>
              </div>
              <button className="mt-5 min-h-11 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white" data-testid="contact-submit-button">Preview support request</button>
              {sent && <p className="mt-4 text-sm font-bold text-emerald-700" data-testid="contact-success">Demo request recorded locally. Nothing was sent externally.</p>}
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}