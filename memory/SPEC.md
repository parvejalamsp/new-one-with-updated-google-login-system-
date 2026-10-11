# collectFlow living spec

## Product
collectFlow is a BillNest-inspired Indian invoicing and billing workspace. The public experience includes the marketing homepage, pricing, GST calculator, FAQ, login, signup, and password-reset simulator. The app workspace includes overview, invoices, clients, recurring billing, reports/GST, and settings.

## Data and auth
The current build intentionally uses localStorage mock data and mock authentication. `collectflow-demo-state` stores seeded invoices, clients, and recurring schedules; `collectflow-session=demo` gates the dashboard flow. No live payment, email, Clerk, or backend data integration is active.

## Key flows
- Homepage calculator updates GST, tax split, gateway fee, and invoice total live.
- Pricing supports monthly/annual toggle and invoice-volume plan recommendation.
- Login has a one-click demo workspace entry plus a local email/password-shaped form.
- Signup stores the entered business profile locally and enters the demo workspace.
- Dashboard links into invoice creation, client creation, recurring schedules, reports, and settings.
- Invoice and client creation/toggles persist to localStorage; invoice print uses the browser print dialog.