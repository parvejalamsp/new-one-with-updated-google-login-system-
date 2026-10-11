# collectFlow living spec

## Product
collectFlow is an invoicing and payment-follow-up demo workspace for small Indian agencies, studios, consultants, and service businesses. The public experience includes the marketing homepage, capacity-aligned pricing, transparent GST/interest calculators, FAQ, demo auth screens, and lightweight About, Security, Contact, Help, GST Resources, API Docs, Terms, and Privacy pages. The app workspace includes overview, invoices, clients, recurring billing, reports/GST, and settings.

## Data and auth
Google-only authentication is real and managed by Emergent/Clerk. Public marketing and information routes stay open; every `/app` route requires a valid session, restores signed-in sessions, shows the Google identity, and supports sign-out. Business data remains local and account-scoped in `localStorage` under `collectflow-demo-state:<clerk-user-id>`; it is not synchronized across devices or persisted to MongoDB. No live payment, reminder, email, support, or document-delivery integration is active.

## Key flows
- Homepage calculator updates GST, tax split, gateway fee, and invoice total live.
- Pricing supports monthly/annual toggle and exact capacity thresholds: Free ≤5, Starter ≤50, Professional ≤200, Business >200.
- The overdue-interest calculator accepts a user-entered annual rate, source, and optional effective date and displays its formula and assumptions.
- Login uses a dedicated managed Google-only sign-in screen; failed or unavailable auth never bypasses workspace protection.
- Dashboard figures are calculated from the same local invoice list used by the sidebar count and invoice summary.
- The collection queue groups invoices by client and shows outstanding, overdue, invoice-count, due-date, and illustrative next-action rollups.
- Invoice detail includes client context and local follow-up activity. Follow-ups can be added, edited, and completed without sending a message.
- Invoice and client collection-summary previews support browser print and local demo text downloads without server-side records.
- Empty, filtered-empty, partial-data, and unreadable-data states provide clear reset or recovery actions.
- Draft creation validates client, description, positive amount, and date order, then shows live subtotal, tax estimate, and total before saving.
- Invoice, client, follow-up, and schedule changes persist per signed-in account on the current browser; invoice print uses the browser print dialog.

## Demo boundaries
- Authentication is REAL. Payments, reminders, business persistence, follow-ups, document delivery, and recommendations are MOCKED or LOCAL-ONLY and have no external side effects.
- GST fields and calculations are planning aids only; the app makes no compliance, filing, legal, or tax-advice claim.
- Demo dates are anchored to the seeded sample date `2026-07-14`, not the visitor's device clock.