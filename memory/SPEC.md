# collectFlow living spec

## Product
collectFlow is a functional invoicing and client follow-up MVP for small Indian agencies, studios, consultants, and service businesses. Public pages include marketing, illustrative pricing, estimate calculators, FAQ, and information pages. The authenticated workspace includes persistent clients, invoices, manual payments, follow-ups, reports, real PDF/CSV downloads, and interface settings.

## Data and auth
Google-only authentication is managed by Emergent/Clerk. Every `/app` route requires a valid session. Clients, invoices, payments, and follow-ups persist in MongoDB with every query scoped by the verified Clerk user ID. Existing `collectflow-demo-state:<clerk-user-id>` records remain untouched and read-only; localStorage is used only for harmless interface preferences such as theme.

## Key flows
- Homepage calculator updates GST, tax split, gateway fee, and invoice total live.
- Pricing supports monthly/annual toggle and exact capacity thresholds: Free ≤5, Starter ≤50, Professional ≤200, Business >200.
- The overdue-interest calculator accepts a user-entered annual rate, source, and optional effective date and displays its formula and assumptions.
- Login uses a dedicated managed Google-only sign-in screen; failed or unavailable auth never bypasses workspace protection.
- Clients support create, edit, search, archive/restore, optional GSTIN and contact details, persistent balances, and invoice counts.
- Invoices use atomic per-agency numbers, validated dates and amounts, editable drafts, pending/due-soon/overdue/paid states, GST totals, filters, and client rollups.
- Manual payment records update persistent invoice balances and paid state without implying that collectFlow moved money.
- Follow-ups persist and can be added, edited, or completed without sending external messages; email reminder drafts open through `mailto:`.
- Invoice PDF and report CSV downloads generate real local files from authenticated persistent records.

## Demo boundaries
- Authentication, MongoDB persistence, client/invoice/payment/follow-up CRUD, PDF export, and CSV export are REAL.
- Payment processing, automatic email/WhatsApp reminders, recurring billing, bank connections, webhooks, and support delivery are UNAVAILABLE or explicitly preview-only.
- GST fields and calculations are planning aids only; the app makes no compliance, filing, legal, or tax-advice claim.
- Status date logic is anchored to the backend date, not the visitor's device clock.