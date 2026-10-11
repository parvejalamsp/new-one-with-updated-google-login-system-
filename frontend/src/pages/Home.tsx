import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Check, ChevronDown, IndianRupee, LockKeyhole, ReceiptIndianRupee, Sparkles, WalletCards, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Footer, PublicNav, formatINR } from "@/components/collectflow";

const features = [
  [ReceiptIndianRupee, "Smart invoicing", "Auto-numbered drafts, GST-aware fields, HSN/SAC codes, and print-preview layouts."],
  [WalletCards, "Customer CRM", "See each sample client, GSTIN, outstanding balance, and invoice history together."],
  [IndianRupee, "Payment preview", "Explore test-mode and UPI placeholder states without moving real money."],
  [BarChart3, "Sample analytics", "Review illustrative revenue, cash-flow, and collection-priority layouts."],
  [LockKeyhole, "Demo access", "Enter a local sample workspace without using real credentials or customer data."],
  [Zap, "Fast and focused", "Keep the next collection action within easy reach."],
] as const;

const plans = [
  { name: "Free", price: "₹0", capacity: "Up to 5 invoices/month" },
  { name: "Starter", price: "₹499", capacity: "Up to 50 invoices/month" },
  { name: "Professional", price: "₹999", capacity: "Up to 200 invoices/month", popular: true },
  { name: "Business", price: "₹1,999", capacity: "Unlimited invoices" },
];

export default function Home() {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(18);
  const [split, setSplit] = useState<"split" | "igst">("split");
  const [gateway, setGateway] = useState(true);
  const [invoiceRate, setInvoiceRate] = useState(125000);
  const tax = amount * rate / 100;
  const fee = gateway ? (amount + tax) * .02 : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <PublicNav />
      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-36 sm:px-6 lg:pb-28 lg:pt-48">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[620px] w-[900px] max-w-full -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <Badge variant="outline" className="h-auto max-w-full whitespace-normal rounded-full border-blue-200 bg-white px-3 py-1.5 text-left text-blue-700 shadow-sm" data-testid="hero-announcement"><Sparkles className="mr-1.5 size-3.5 shrink-0" />Demo workspace · GST-aware invoice planning</Badge>
              <h1 className="mt-7 max-w-3xl font-heading text-4xl font-extrabold leading-[1.06] tracking-[-.065em] text-slate-950 sm:text-6xl lg:text-7xl" data-testid="hero-heading">Manage invoices, customers & payments <span className="text-blue-600">in one place.</span></h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500" data-testid="hero-description">See what is paid, due soon, or overdue, then choose the next follow-up. Explore a clear agency workflow with no real payment side effects.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link to="/signup" data-testid="hero-btn-start-free" className="min-h-12 rounded-xl bg-slate-950 px-5 py-3.5 text-center text-sm font-bold text-white shadow-xl shadow-slate-900/15 hover:bg-blue-700">Start demo <ArrowRight className="ml-2 inline size-4" /></Link>
                <Link to="/pricing" data-testid="hero-btn-view-pricing" className="min-h-12 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-center text-sm font-bold text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700">View sample pricing</Link>
                <a href="#calculator" data-testid="hero-btn-demo-tour" className="min-h-11 px-2 py-3 text-center text-sm font-semibold text-slate-500 hover:text-slate-950">Try the live estimate ↘</a>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-400"><span>✓ GST-aware fields</span><span>✓ Payment test states</span><span>✓ Print preview</span></div>
            </div>
            <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_-35px_rgba(37,99,235,.4)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><span className="text-xs font-semibold text-slate-400">collectFlow / overview</span><span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">Sample</span></div>
              <div className="grid gap-5 bg-slate-50/70 p-5 sm:p-7">
                <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold text-slate-400">Illustrative total</p><p className="mt-1 font-heading text-2xl font-extrabold tracking-[-.05em] sm:text-3xl">₹3,91,800</p></div><span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">4 invoices</span></div>
                <div className="flex h-32 items-end gap-2 rounded-2xl border border-slate-100 bg-white px-4 pb-4 pt-5">{[35, 50, 44, 68, 55, 82, 65, 94, 75, 100, 83, 92].map((height, index) => <div key={index} className={`flex-1 rounded-t-md ${index > 7 ? "bg-blue-500" : "bg-blue-100"}`} style={{ height: `${height}%` }} />)}</div>
                <div className="grid grid-cols-3 gap-2">{[["Paid", "1"], ["Due soon", "₹48.5K"], ["Overdue", "₹1.25L"]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-100 bg-white p-3"><p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 font-mono text-sm font-bold">{value}</p></div>)}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white" data-testid="trust-metrics">
          <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6"><p className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-blue-600" data-testid="metrics-demo-label">Illustrative demo samples — not verified product results</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[["₹45L", "sample invoiced volume"], ["120", "sample client accounts"], ["4", "sample invoice statuses"], ["0", "real payments processed"]].map(([value, label]) => <div key={label}><p className="font-heading text-2xl font-extrabold">{value}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p></div>)}</div></div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">The calm in your cash flow</p>
          <h2 className="mt-4 max-w-2xl font-heading text-4xl font-extrabold tracking-[-.06em] text-slate-950 sm:text-5xl" data-testid="features-heading">Everything you need to plan the next move.</h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(([Icon, title, text], index) => <div key={title} className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${index === 0 ? "lg:bg-slate-950 lg:text-white" : ""}`} data-testid={`feature-card-${index + 1}`}><span className={`grid size-11 place-items-center rounded-xl ${index === 0 ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-600"}`}><Icon className="size-5" /></span><h3 className="mt-10 font-heading text-xl font-bold">{title}</h3><p className={`mt-3 text-sm leading-6 ${index === 0 ? "text-slate-400" : "text-slate-500"}`}>{text}</p></div>)}</div>
        </section>

        <section id="calculator" className="bg-slate-950 px-4 py-24 text-white sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-300">Live GST estimate</p><h2 className="mt-4 font-heading text-4xl font-extrabold tracking-[-.06em] sm:text-5xl" data-testid="calculator-heading">See the estimate before you draft.</h2><p className="mt-5 max-w-md text-lg leading-8 text-slate-400">Use your own rate and verify any real tax treatment independently.</p><Link to="/calculator" className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-blue-300" data-testid="calculator-full-link">Open full calculators <ArrowRight className="size-4" /></Link></div>
            <div className="rounded-3xl border border-white/10 bg-white/[.06] p-5 sm:p-7">
              <div className="grid gap-6 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-300">Base amount<input value={amount} onChange={(event) => setAmount(Math.max(0, Number(event.target.value)))} type="number" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/10 px-4 font-mono text-white outline-none" data-testid="calculator-input-amount" /></label><label className="text-sm font-semibold text-slate-300">GST rate<select value={rate} onChange={(event) => setRate(Number(event.target.value))} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/10 px-4 text-white outline-none" data-testid="calculator-select-gst-rate"><option className="text-slate-900" value="0">0%</option><option className="text-slate-900" value="5">5%</option><option className="text-slate-900" value="12">12%</option><option className="text-slate-900" value="18">18%</option><option className="text-slate-900" value="28">28%</option></select></label></div>
              <div className="mt-6 flex flex-wrap gap-2"><button onClick={() => setSplit("split")} className={`min-h-10 rounded-lg px-3 text-xs font-bold ${split === "split" ? "bg-blue-600" : "bg-white/10 text-slate-400"}`} data-testid="calculator-toggle-cgst-sgst">CGST + SGST</button><button onClick={() => setSplit("igst")} className={`min-h-10 rounded-lg px-3 text-xs font-bold ${split === "igst" ? "bg-blue-600" : "bg-white/10 text-slate-400"}`} data-testid="calculator-toggle-igst">IGST</button><button onClick={() => setGateway(!gateway)} className={`min-h-10 rounded-lg px-3 text-xs font-bold sm:ml-auto ${gateway ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-slate-400"}`} data-testid="calculator-toggle-gateway">{gateway ? "✓ 2% test fee" : "No test fee"}</button></div>
              <div className="mt-7 grid gap-3 border-t border-white/10 pt-5 text-sm"><div className="flex justify-between gap-4 text-slate-400"><span>Tax estimate · {split === "split" ? "CGST + SGST" : "IGST"}</span><span className="font-mono text-slate-200" data-testid="calculator-output-tax">{formatINR(tax)}</span></div><div className="flex justify-between gap-4 text-slate-400"><span>Test gateway fee</span><span className="font-mono text-slate-200">{formatINR(fee)}</span></div><div className="flex justify-between gap-4 border-t border-white/10 pt-3 font-bold"><span>Estimated total</span><span className="font-mono text-xl text-blue-300" data-testid="calculator-output-total">{formatINR(amount + tax + fee)}</span></div></div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-24 sm:px-6 lg:grid-cols-[.75fr_1.25fr]">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">Live draft preview</p><h2 className="mt-4 font-heading text-4xl font-extrabold tracking-[-.06em]" data-testid="invoice-preview-heading">Clear totals before you save.</h2><label className="mt-8 block text-sm font-bold">Line item rate<input value={invoiceRate} onChange={(event) => setInvoiceRate(Math.max(0, Number(event.target.value)))} type="number" className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono" data-testid="invoice-preview-rate" /></label><Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600" data-testid="invoice-preview-cta">Try the local workspace <ArrowRight className="size-4" /></Link></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40"><div className="flex justify-between gap-4"><div><p className="text-xs font-bold text-blue-600">SAMPLE INVOICE</p><p className="mt-2 font-heading text-2xl font-extrabold">collect<span className="text-blue-600">Flow</span></p></div><p className="font-mono text-sm font-bold">INV-DEMO-0891</p></div><div className="mt-10 flex justify-between gap-4 border-y border-slate-100 py-5 text-sm"><span>Agency operations support</span><span className="font-mono font-bold">{formatINR(invoiceRate)}</span></div><div className="ml-auto mt-5 max-w-xs text-sm"><div className="flex justify-between"><span>Tax estimate 18%</span><span className="font-mono">{formatINR(invoiceRate * .18)}</span></div><div className="mt-3 flex justify-between border-t pt-3 text-lg font-bold"><span>Total</span><span className="font-mono text-blue-600">{formatINR(invoiceRate * 1.18)}</span></div></div></div>
        </section>

        <section className="bg-slate-50 px-4 py-24 sm:px-6"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">Illustrative demo plans</p><h2 className="mt-4 font-heading text-4xl font-extrabold tracking-[-.06em]" data-testid="pricing-heading">Capacity that matches the recommendation.</h2><div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{plans.map((plan) => <div key={plan.name} className={`rounded-2xl border p-6 ${plan.popular ? "border-blue-500 bg-slate-950 text-white" : "border-slate-200 bg-white"}`} data-testid={`pricing-card-${plan.name.toLowerCase()}`}><p className="text-sm font-bold text-blue-500">{plan.name}</p><p className="mt-5 font-heading text-3xl font-extrabold">{plan.price}<span className="text-sm font-medium text-slate-400">/month</span></p><p className="mt-4 flex gap-2 text-sm font-bold"><Check className="size-4 text-emerald-500" />{plan.capacity}</p><Link to="/signup" className={`mt-6 block min-h-11 rounded-xl px-4 py-3 text-center text-sm font-bold ${plan.popular ? "bg-blue-500 text-white" : "bg-slate-100"}`} data-testid={`pricing-plan-${plan.name.toLowerCase()}-cta`}>Try in demo</Link></div>)}</div><Link to="/pricing" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-blue-600" data-testid="pricing-see-all">Compare sample plans <ArrowRight className="size-4" /></Link></div></section>

        <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">Questions, answered</p><h2 className="mt-4 font-heading text-4xl font-extrabold tracking-[-.06em]">Know the demo boundaries.</h2></div><div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">{[["Can I include GST fields?", "Yes, for planning only. No tax treatment is verified."], ["Does the demo move money?", "No. Payment and reminder states have no external side effects."], ["Where is data stored?", "Sample changes remain in this browser's localStorage."]].map(([question, answer], index) => <details key={question} className="group py-5" data-testid={`faq-item-${index + 1}`}><summary className="flex cursor-pointer list-none justify-between gap-4 font-semibold">{question}<ChevronDown className="size-4 shrink-0 group-open:rotate-180" /></summary><p className="mt-3 text-sm leading-6 text-slate-500">{answer}</p></details>)}</div><Link to="/faq" className="mx-auto mt-8 flex w-fit min-h-11 items-center gap-2 text-sm font-bold text-blue-600" data-testid="faq-see-all">Browse all FAQs <ArrowRight className="size-4" /></Link></section>

        <section className="px-4 pb-24 sm:px-6"><div className="mx-auto max-w-7xl rounded-[28px] bg-blue-600 px-6 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-200">Ready to explore?</p><h2 className="mt-4 max-w-2xl font-heading text-4xl font-extrabold tracking-[-.06em]">Turn sample invoices into a clear collection plan.</h2><p className="mt-4 max-w-xl text-blue-100">No account, payment, reminder, or customer communication is created externally.</p></div><Link to="/signup" className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-blue-700 lg:mt-0" data-testid="bottom-cta-signup">Create demo profile <ArrowRight className="ml-2 size-4" /></Link></div></section>
      </main>
      <Footer />
    </div>
  );
}