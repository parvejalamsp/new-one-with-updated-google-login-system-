# collectFlow living spec

## Product
collectFlow is an invoicing and payment-follow-up demo workspace for small Indian agencies, studios, consultants, and service businesses. The public experience includes the marketing homepage, capacity-aligned pricing, transparent GST/interest calculators, FAQ, demo auth screens, and lightweight About, Security, Contact, Help, GST Resources, API Docs, Terms, and Privacy pages. The app workspace includes overview, invoices, clients, recurring billing, reports/GST, and settings.

## Data and auth
The current build intentionally uses localStorage mock data and mock authentication. `collectflow-demo-state` stores seeded invoices, clients, and recurring schedules; `collectflow-session=demo` gates the dashboard flow. No live payment, reminder, email, support, export, Clerk, or backend business-data integration is active. All seeded figures and landing metrics are explicitly labelled illustrative samples.

## Key flows
- Homepage calculator updates GST, tax split, gateway fee, and invoice total live.
- Pricing supports monthly/annual toggle and exact capacity thresholds: Free ≤5, Starter ≤50, Professional ≤200, Business >200.
- The overdue-interest calculator accepts a user-entered annual rate, source, and optional effective date and displays its formula and assumptions.
- Login has a one-click demo workspace entry plus a clearly labelled local email/password-shaped preview form.
- Signup stores the entered business profile locally and enters the demo workspace.
- Dashboard figures are calculated from the same local invoice list used by the sidebar count and invoice summary.
- Invoices support paid, pending, due-soon, overdue, and draft statuses; client/invoice/status search; status filtering; next-action guidance; and local feedback for mocked actions.
- Draft creation validates client, description, positive amount, and date order, then shows live subtotal, tax estimate, and total before saving.
- Invoice, client, and schedule changes persist to localStorage; invoice print uses the browser print dialog.

## Demo boundaries
- Payment, reminder, email, support, report export, API, and password-reset actions are MOCKED and have no external side effects.
- GST fields and calculations are planning aids only; the app makes no compliance, filing, legal, or tax-advice claim.
- Demo dates are anchored to the seeded sample date `2026-07-14`, not the visitor's device clock.