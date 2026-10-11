import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Archive, Building2, Mail, MapPin, Pencil, Phone, Plus, Search, Users, X } from "lucide-react";
import { AppContent, AppShell } from "@/components/AppWorkspace";
import { apiPatch, apiPost } from "@/lib/api";
import { formatINR, useWorkspace, workspaceKey, type Client, type ClientInput, type ClientUpdate } from "@/lib/business";

const emptyForm: ClientInput = { business_name: "", gstin: "", contact_name: "", email: null, phone: "", address: "", state: "" };

export default function MvpClients() {
  const [params] = useSearchParams();
  const workspace = useWorkspace();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientInput>(emptyForm);
  const [showForm, setShowForm] = useState(params.get("new") === "1");
  const [feedback, setFeedback] = useState("");

  const save = useMutation({
    mutationFn: () => editing
      ? apiPatch<Client>(`/clients/${editing.id}`, { ...form, archived: editing.archived } satisfies ClientUpdate)
      : apiPost<Client>("/clients", form),
    onSuccess: async (client) => {
      await queryClient.invalidateQueries({ queryKey: workspaceKey });
      setFeedback(`${client.business_name} ${editing ? "updated" : "created"}.`);
      setEditing(null); setForm(emptyForm); setShowForm(false);
    },
  });
  const archive = useMutation({
    mutationFn: (client: Client) => apiPatch<Client>(`/clients/${client.id}`, { business_name: client.business_name, gstin: client.gstin, contact_name: client.contact_name, email: client.email, phone: client.phone, address: client.address, state: client.state, archived: !client.archived } satisfies ClientUpdate),
    onSuccess: async (client) => { await queryClient.invalidateQueries({ queryKey: workspaceKey }); setFeedback(`${client.business_name} ${client.archived ? "archived" : "restored"}.`); },
  });

  const clients = (workspace.data?.clients ?? []).filter((client) => {
    if (!showArchived && client.archived) return false;
    const haystack = `${client.business_name} ${client.contact_name} ${client.email ?? ""} ${client.gstin}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const startEdit = (client: Client) => {
    setEditing(client);
    setForm({ business_name: client.business_name, gstin: client.gstin, contact_name: client.contact_name, email: client.email, phone: client.phone, address: client.address, state: client.state });
    setShowForm(true);
  };

  return <><AppShell title="Clients"><></></AppShell><AppContent title="Clients" eyebrow="Persistent agency records" action={<button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white sm:w-auto" data-testid="client-btn-add"><Plus className="size-4" />Add client</button>}>
    <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800" data-testid="client-storage-notice"><strong>Persistent workspace:</strong> client records are stored in MongoDB and scoped to your signed-in account. Existing browser demo data remains untouched and is not imported.</div>
    {feedback && <div className="mb-5 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800" data-testid="client-feedback"><span>{feedback}</span><button onClick={() => setFeedback("")} aria-label="Dismiss" data-testid="client-feedback-dismiss"><X className="size-4" /></button></div>}
    {showForm && <section className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/60 p-5" data-testid="client-form"><div className="flex items-center justify-between"><h2 className="font-heading text-xl font-bold" data-testid="client-form-title">{editing ? "Edit client" : "Create client"}</h2><button onClick={() => { setShowForm(false); setEditing(null); }} className="grid size-10 place-items-center rounded-lg" aria-label="Close client form" data-testid="client-form-close"><X className="size-4" /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><label className="text-sm font-semibold">Business name *<input value={form.business_name} onChange={(event) => setForm({ ...form, business_name: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" data-testid="client-input-name" /></label><label className="text-sm font-semibold">Contact name<input value={form.contact_name} onChange={(event) => setForm({ ...form, contact_name: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" data-testid="client-input-contact" /></label><label className="text-sm font-semibold">Email<input type="email" value={form.email ?? ""} onChange={(event) => setForm({ ...form, email: event.target.value || null })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" data-testid="client-input-email" /></label><label className="text-sm font-semibold">Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" data-testid="client-input-phone" /></label><label className="text-sm font-semibold">GSTIN<input value={form.gstin} onChange={(event) => setForm({ ...form, gstin: event.target.value.toUpperCase() })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono" placeholder="Optional 15-character GSTIN" data-testid="client-input-gstin" /></label><label className="text-sm font-semibold">State<input value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" data-testid="client-input-state" /></label><label className="text-sm font-semibold sm:col-span-2 lg:col-span-3">Address<textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2" data-testid="client-input-address" /></label></div>{save.error && <p className="mt-4 text-sm font-semibold text-rose-700" data-testid="client-form-error">{save.error instanceof Error ? save.error.message : "Could not save client"}</p>}<button onClick={() => save.mutate()} disabled={save.isPending || !form.business_name.trim()} className="mt-5 min-h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white disabled:opacity-50" data-testid="client-save-button">{save.isPending ? "Saving…" : editing ? "Save changes" : "Create client"}</button></section>}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clients…" className="h-11 w-full rounded-xl border border-slate-200 pl-9 pr-3" data-testid="client-search-input" /></div><button onClick={() => setShowArchived(!showArchived)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600" data-testid="client-archived-toggle">{showArchived ? "Hide archived" : "Show archived"}</button><div className="flex min-h-11 items-center gap-2 rounded-xl bg-slate-50 px-4 text-sm font-semibold text-slate-500" data-testid="client-count"><Users className="size-4" />{workspace.data?.summary.client_count ?? 0} active</div></div>
      {workspace.isPending && <div className="p-10 text-center text-sm text-slate-500" data-testid="client-loading-state">Loading your clients…</div>}
      {workspace.isError && <div className="p-10 text-center" data-testid="client-error-state"><p className="font-bold text-rose-700">Clients could not be loaded.</p><button onClick={() => workspace.refetch()} className="mt-4 min-h-11 rounded-xl border px-4 text-sm font-bold" data-testid="client-retry-button">Retry</button></div>}
      {!workspace.isPending && !workspace.isError && <div className="mt-6 grid gap-3">{clients.map((client) => <article key={client.id} className={`rounded-2xl border p-5 ${client.archived ? "border-slate-200 bg-slate-50 opacity-75" : "border-slate-100"}`} data-testid={`client-row-${client.id}`}><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex gap-3"><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Building2 className="size-5" /></span><div><h3 className="font-heading font-bold" data-testid={`client-name-${client.id}`}>{client.business_name}</h3><p className="mt-1 text-sm text-slate-500">{client.contact_name || "No contact name"} {client.state ? `· ${client.state}` : ""}</p></div></div><div className="sm:text-right"><p className="text-xs uppercase tracking-wider text-slate-400">Outstanding</p><p className="mt-1 font-mono font-bold" data-testid={`client-balance-${client.id}`}>{formatINR(client.balance)}</p><p className="mt-1 text-xs text-slate-400">{client.invoice_count} invoices</p></div></div><div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-slate-100 pt-4 text-xs text-slate-500">{client.email && <span className="flex items-center gap-1.5"><Mail className="size-3.5" />{client.email}</span>}{client.phone && <span className="flex items-center gap-1.5"><Phone className="size-3.5" />{client.phone}</span>}{client.gstin && <span className="flex items-center gap-1.5 font-mono"><MapPin className="size-3.5" />{client.gstin}</span>}<div className="ml-auto flex gap-2"><button onClick={() => startEdit(client)} className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-blue-50 px-3 font-bold text-blue-700" data-testid={`client-edit-${client.id}`}><Pencil className="size-3.5" />Edit</button><button onClick={() => archive.mutate(client)} className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-slate-100 px-3 font-bold text-slate-600" data-testid={`client-archive-${client.id}`}><Archive className="size-3.5" />{client.archived ? "Restore" : "Archive"}</button></div></div></article>)}{clients.length === 0 && <div className="p-10 text-center" data-testid="client-empty-state"><Building2 className="mx-auto size-10 text-slate-300" /><p className="mt-4 font-heading font-bold">No clients yet.</p><p className="mt-2 text-sm text-slate-500">Create your first persistent client to start invoicing.</p></div>}</div>}
    </section>
  </AppContent></>;
}