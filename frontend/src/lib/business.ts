import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export type InvoiceStatus = "draft" | "pending" | "due_soon" | "overdue" | "paid";
export type FollowUpStatus = "planned" | "completed";

export interface Client {
  id: string;
  business_name: string;
  gstin: string;
  contact_name: string;
  email: string | null;
  phone: string;
  address: string;
  state: string;
  archived: boolean;
  balance: number;
  invoice_count: number;
  created_at: string;
  updated_at: string;
}

export interface ClientInput {
  business_name: string;
  gstin: string;
  contact_name: string;
  email: string | null;
  phone: string;
  address: string;
  state: string;
}

export interface ClientUpdate extends ClientInput { archived: boolean }

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  description: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  gst_rate: number;
  hsn_sac: string;
  notes: string;
  tax: number;
  total: number;
  amount_paid: number;
  balance: number;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
}

export interface InvoiceInput {
  client_id: string;
  description: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  gst_rate: number;
  hsn_sac: string;
  notes: string;
  status: "draft" | "pending";
}

export interface Payment {
  id: string;
  invoice_id: string;
  invoice_number: string;
  amount: number;
  paid_on: string;
  method: "bank_transfer" | "upi" | "cash" | "cheque" | "other";
  reference: string;
  notes: string;
  created_at: string;
}

export interface PaymentInput {
  amount: number;
  paid_on: string;
  method: Payment["method"];
  reference: string;
  notes: string;
}

export interface FollowUp {
  id: string;
  invoice_id: string;
  client_id: string;
  note: string;
  due_date: string;
  status: FollowUpStatus;
  created_at: string;
  updated_at: string;
}

export interface FollowUpInput {
  invoice_id: string;
  note: string;
  due_date: string;
  status: FollowUpStatus;
}

export interface WorkspaceSummary {
  client_count: number;
  invoice_count: number;
  total_invoiced: number;
  total_outstanding: number;
  total_overdue: number;
  total_paid: number;
}

export interface Workspace {
  today: string;
  clients: Client[];
  invoices: Invoice[];
  payments: Payment[];
  follow_ups: FollowUp[];
  summary: WorkspaceSummary;
}

export const workspaceKey = ["workspace"] as const;
export function useWorkspace() {
  return useQuery({ queryKey: workspaceKey, queryFn: () => apiGet<Workspace>("/workspace") });
}

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
}

export const statusLabels: Record<InvoiceStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  due_soon: "Due soon",
  overdue: "Overdue",
  paid: "Paid",
};