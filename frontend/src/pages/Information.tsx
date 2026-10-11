import { useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { BookOpen, CheckCircle2, FileCode2, Landmark, LockKeyhole, Mail, Scale, ShieldCheck } from "lucide-react";
import { Footer, PublicNav } from "@/components/PublicChrome";

const pages = {
  "/about": { eyebrow: "About collectFlow", title: "Built for Indian businesses who deserve better billing tools.", intro: "collectFlow was founded with a simple mission: make invoicing and billing effortless for small and medium businesses in India.", icon: Landmark, sections: [["Why we built it", "We understand the challenges of GST compliance, payment tracking, and customer management. That is why collectFlow brings the work into one beautiful, easy-to-use dashboard."], ["What works now", "Persistent account-scoped clients, invoices, manual payment records, follow-ups, reports, and professional invoice PDFs."], ["Our focus", "Clear financial figures and an obvious next action help small teams spend less time chasing information and more time growing."]] },
  "/security": { eyebrow: "Security", title: "Account-scoped records with clear boundaries.", intro: "Google authentication protects the workspace and every business-data query is scoped to the signed-in user.", icon: ShieldCheck, sections: [["Persistent data", "Clients, invoices, payments, and follow-ups are stored in MongoDB, not browser storage."], ["Authentication", "Configured Google sign-in establishes the user identity used for record ownership."], ["External services", "Payment processing and automatic email or WhatsApp delivery remain disabled until providers are configured."]] },
  "/contact": { eyebrow: "Contact", title: "Talk to the demo team.", intro: "Use this form to preview the support experience. It does not send an external message.", icon: Mail, sections: [["Response mode", "Submitting shows an on-screen demo confirmation with no external side effect."], ["For product feedback", "Describe the workflow you want to evaluate without including real client, payment, or credential data."]] },
  "/help": { eyebrow: "Help center", title: "Get oriented quickly.", intro: "A short guide to the current collectFlow workspace.", icon: BookOpen, sections: [["Start with clients", "Create a client with optional GSTIN and contact details, then create an invoice."], ["Track collection", "Move drafts to pending, record manual payments, and add internal follow-ups."], ["Know the boundaries", "PDF and CSV downloads are real. Payment processing and automatic reminders are unavailable."]] },
  "/gst-resources": { eyebrow: "GST resources", title: "Planning fields, not tax advice.", intro: "collectFlow demonstrates common invoice fields such as GSTIN, HSN/SAC, tax rates, and tax splits.", icon: Scale, sections: [["Verify before use", "Tax treatment depends on your facts. Confirm rates, place of supply, and invoice requirements with a qualified adviser."], ["Calculator scope", "Calculator outputs are estimates based only on values and rates entered by the user."], ["No compliance claim", "The demo does not file returns, validate registrations, or certify invoice compliance."]] },
  "/api-docs": { eyebrow: "API docs", title: "Private application APIs.", intro: "The current client, invoice, payment, follow-up, report, and PDF endpoints are private to the signed-in application.", icon: FileCode2, sections: [["Current availability", "No public developer API or API key program is available."], ["Ownership", "The server validates the Google session and scopes every business query to its user ID."], ["Future direction", "External API access requires a separate authentication, rate-limit, and audit design."]] },
  "/terms": { eyebrow: "Terms", title: "Product boundaries.", intro: "collectFlow stores business records but is not a payment processor, tax filing service, or source of legal advice.", icon: CheckCircle2, sections: [["Financial actions", "Manual payment records do not move money or confirm bank settlement."], ["Communications", "Email reminder drafts open in your email application; collectFlow does not send them."], ["Your responsibility", "Verify invoice, tax, and client details before use."]] },
  "/privacy": { eyebrow: "Privacy", title: "What collectFlow stores.", intro: "Business records are stored in MongoDB and scoped to the authenticated Google user ID.", icon: LockKeyhole, sections: [["Business records", "Clients, invoices, manual payments, and follow-ups are persistent server records."], ["Browser storage", "Existing demo records remain untouched and read-only; harmless interface preferences may stay local."], ["Identity", "Google authentication is managed by the configured authentication provider."]] },
  "/refund": { eyebrow: "Refund policy", title: "Clear plan and payment boundaries.", intro: "No paid collectFlow subscription or checkout is active in this MVP.", icon: CheckCircle2, sections: [["Current availability", "The pricing page is an evaluation surface; its Buy Now actions lead to account creation and do not charge a card."], ["Future purchases", "Any future paid plan will show its refund terms before checkout."], ["Need help?", "Use the contact page to preview the support flow without sharing sensitive payment information."]] },
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
          {pathname === "/about" && <div className="mt-8 grid gap-4 sm:grid-cols-3" data-testid="about-public-metrics">{[["10K+", "Invoices Created"], ["500+", "Happy Businesses"], ["99.9%", "Uptime"]].map(([value, label], index) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm" data-testid={`about-metric-${index + 1}`}><p className="font-heading text-3xl font-extrabold text-blue-600">{value}</p><p className="mt-2 text-sm text-slate-500">{label}</p></div>)}</div>}
          {pathname === "/contact" && (
            <form onSubmit={submit} className="mt-10 rounded-2xl border border-blue-100 bg-blue-50/70 p-6 sm:p-8" data-testid="contact-demo-form">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">Name<input required className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" data-testid="contact-name-input" /></label>
                <label className="text-sm font-semibold text-slate-700">Email<input required type="email" className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" data-testid="contact-email-input" /></label>
                <label className="text-sm font-semibold text-slate-700">Phone (optional)<input type="tel" className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" data-testid="contact-phone-input" /></label>
                <label className="text-sm font-semibold text-slate-700">Subject<input required className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" data-testid="contact-subject-input" /></label>
                <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Your message<textarea required className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2" data-testid="contact-message-input" /></label>
              </div>
              <button className="mt-5 min-h-11 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700" data-testid="contact-submit-button">Send Message</button>
              {sent && <p className="mt-4 text-sm font-bold text-emerald-700" data-testid="contact-success">Demo request recorded locally. Nothing was sent externally.</p>}
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}