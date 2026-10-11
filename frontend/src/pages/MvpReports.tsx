import { Download, FileText } from "lucide-react";
import { AppContent, AppShell } from "@/components/AppWorkspace";
import { formatINR, statusLabels, useWorkspace } from "@/lib/business";

export default function MvpReports() {
  const workspace = useWorkspace();
  const downloadCsv = () => {
    if (!workspace.data) return;
    const rows = [["Invoice", "Client", "Status", "Invoice date", "Due date", "Subtotal", "GST", "Total", "Paid", "Balance"], ...workspace.data.invoices.map((invoice) => [invoice.invoice_number, invoice.client_name, statusLabels[invoice.status], invoice.invoice_date, invoice.due_date, String(invoice.subtotal), String(invoice.tax), String(invoice.total), String(invoice.amount_paid), String(invoice.balance)])];
    const content = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "collectflow-invoices.csv"; anchor.click(); URL.revokeObjectURL(url);
  };
  const data = workspace.data;
  return <><AppShell title="Reports"><></></AppShell><AppContent title="Reports" eyebrow="Persistent workspace totals" action={<button onClick={downloadCsv} disabled={!data} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border bg-white px-4 text-sm font-bold disabled:opacity-50 sm:w-auto" data-testid="reports-export-button"><Download className="size-4" />Download CSV</button>}>
    <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800" data-testid="reports-accuracy-notice"><strong>Actual workspace data:</strong> these totals are calculated from your account-scoped invoices and manual payment records. This is not a GST return or tax filing.</div>
    {data && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Total invoiced", formatINR(data.summary.total_invoiced)], ["Payments recorded", formatINR(data.summary.total_paid)], ["Outstanding", formatINR(data.summary.total_outstanding)], ["Overdue", formatINR(data.summary.total_overdue)]].map(([label, value]) => <div key={label} className="rounded-2xl border bg-white p-5" data-testid={`report-${label.toLowerCase().replaceAll(" ", "-")}`}><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 font-heading text-2xl font-extrabold">{value}</p></div>)}</div><section className="mt-6 overflow-hidden rounded-2xl border bg-white"><div className="border-b p-5"><h2 className="font-heading text-lg font-bold">Invoice status breakdown</h2></div><div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5">{Object.entries(statusLabels).map(([status, label]) => <div key={status} className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 font-mono text-xl font-bold">{data.invoices.filter((invoice) => invoice.status === status).length}</p></div>)}</div></section></>}
    {!data && <div className="rounded-2xl border bg-white p-12 text-center text-sm text-slate-500" data-testid="reports-loading-state"><FileText className="mx-auto mb-3 size-8 text-slate-300" />Loading report data…</div>}
  </AppContent></>;
}