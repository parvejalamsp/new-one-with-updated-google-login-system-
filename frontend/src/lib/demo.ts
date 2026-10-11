export type InvoiceStatus = "Paid" | "Pending" | "Due soon" | "Overdue" | "Draft";

export interface InvoiceItem {
  description: string;
  hsn: string;
  quantity: number;
  rate: number;
  gst: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  amount: number;
  tax: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  gstin: string;
  state: string;
  balance: number;
}

export interface RecurringBill {
  id: string;
  client: string;
  plan: string;
  amount: number;
  frequency: "Monthly" | "Quarterly" | "Annually";
  nextBill: string;
  status: "Active" | "Paused";
}

export interface DemoState {
  invoices: Invoice[];
  clients: Client[];
  recurring: RecurringBill[];
}

export const DEMO_TODAY = "2026-07-14";

const seedState: DemoState = {
  clients: [
    { id: "cli_1", name: "Zomatech Logistics Pvt Ltd", contact: "Aarav Sharma", email: "billing@zomatech.in", phone: "+91 98201 44321", gstin: "27AAACZ1234F1Z5", state: "Maharashtra", balance: 0 },
    { id: "cli_2", name: "Kaveri Studio & Design", contact: "Priya Sundaram", email: "priya@kaveristudio.com", phone: "+91 98450 11299", gstin: "29AABCK9988D1Z2", state: "Karnataka", balance: 48500 },
    { id: "cli_3", name: "BlueRidge Cloud Labs", contact: "Rohan Verma", email: "finance@blueridge.io", phone: "+91 99100 88210", gstin: "07AAAAA0000A1Z5", state: "Delhi", balance: 125000 },
  ],
  invoices: [
    { id: "INV-2026-001", clientId: "cli_1", clientName: "Zomatech Logistics Pvt Ltd", date: "2026-07-01", dueDate: "2026-07-15", amount: 147500, tax: 22500, status: "Paid", items: [{ description: "Cloud Billing Automation Infrastructure", hsn: "998314", quantity: 1, rate: 125000, gst: 18 }] },
    { id: "INV-2026-002", clientId: "cli_2", clientName: "Kaveri Studio & Design", date: "2026-07-08", dueDate: "2026-07-22", amount: 48500, tax: 7398, status: "Due soon", items: [{ description: "UI/UX Design Retainer - July 2026", hsn: "998391", quantity: 1, rate: 41102, gst: 18 }] },
    { id: "INV-2026-003", clientId: "cli_3", clientName: "BlueRidge Cloud Labs", date: "2026-06-15", dueDate: "2026-06-30", amount: 125000, tax: 19068, status: "Overdue", items: [{ description: "Annual ERP API Integration License", hsn: "997331", quantity: 1, rate: 105932, gst: 18 }] },
    { id: "INV-2026-004", clientId: "cli_1", clientName: "Zomatech Logistics Pvt Ltd", date: "2026-07-12", dueDate: "2026-08-12", amount: 70800, tax: 10800, status: "Pending", items: [{ description: "Operations dashboard support", hsn: "998314", quantity: 1, rate: 60000, gst: 18 }] },
  ],
  recurring: [
    { id: "sub_1", client: "Kaveri Studio & Design", plan: "Design retainer", amount: 48500, frequency: "Monthly", nextBill: "Aug 08, 2026", status: "Active" },
    { id: "sub_2", client: "BlueRidge Cloud Labs", plan: "API integration license", amount: 125000, frequency: "Annually", nextBill: "Jun 15, 2027", status: "Active" },
    { id: "sub_3", client: "Northstar Retail", plan: "Growth support", amount: 18000, frequency: "Quarterly", nextBill: "Sep 01, 2026", status: "Paused" },
  ],
};

function migrateState(saved: DemoState): DemoState {
  const invoices = saved.invoices.map((invoice) => {
    if (invoice.status === "Pending" && invoice.dueDate >= DEMO_TODAY && invoice.dueDate <= "2026-07-24") {
      return { ...invoice, status: "Due soon" as const };
    }
    return invoice;
  });
  if (!invoices.some((invoice) => invoice.status === "Pending")) invoices.push(seedState.invoices[3]);
  return { ...saved, invoices };
}

export function readDemoState(): DemoState {
  try {
    const saved = localStorage.getItem("collectflow-demo-state");
    if (saved) {
      const parsed = JSON.parse(saved) as DemoState;
      if (localStorage.getItem("collectflow-demo-schema") === "2") return parsed;
      const migrated = migrateState(parsed);
      localStorage.setItem("collectflow-demo-state", JSON.stringify(migrated));
      localStorage.setItem("collectflow-demo-schema", "2");
      return migrated;
    }
  } catch {
    // A private browser or malformed demo payload should still get a usable app.
  }
  return seedState;
}

export function writeDemoState(state: DemoState) {
  localStorage.setItem("collectflow-demo-state", JSON.stringify(state));
  localStorage.setItem("collectflow-demo-schema", "2");
}

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function gstStateFromGstin(gstin: string) {
  const states: Record<string, string> = { "07": "Delhi", "09": "Uttar Pradesh", "19": "West Bengal", "24": "Gujarat", "27": "Maharashtra", "29": "Karnataka", "33": "Tamil Nadu" };
  return states[gstin.slice(0, 2)] ?? "Other state";
}

export function nextCollectionAction(status: InvoiceStatus) {
  if (status === "Overdue") return "Plan follow-up";
  if (status === "Due soon") return "Queue demo reminder";
  if (status === "Pending") return "Review due date";
  if (status === "Draft") return "Continue draft";
  return "View receipt";
}

export const isDemoLoggedIn = () => localStorage.getItem("collectflow-session") === "demo";