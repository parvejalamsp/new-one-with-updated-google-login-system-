# collectFlow Improvement Plan

collectFlow is an invoicing and payment-follow-up workspace for small Indian agencies managing many client accounts.
It combines a clear public product site with a practical demo workspace for seeing what is due and deciding what to do next.

## Who it’s for

- Small agencies, studios, consultants, and service businesses in India
- Owners and finance operators who manage invoices for multiple clients
- Teams that need a quick view of paid, pending, due-soon, and overdue work without adding real payment side effects

## Core features and experience

- Preserve the existing collectFlow visual identity, public pages, demo login, calculators, pricing, FAQ, and workspace screens
- Correct invoice-count consistency across the navigation badge, invoice list, and summary cards
- Correct pricing recommendations so slider values, recommended plans, and stated plan capacities agree
- Make overdue-interest calculation transparent: editable annual rate, estimate label, formula, assumptions, and source/effective-date fields when known; remove unsupported “current” and legal/tax claims
- Replace misleading placeholder footer links with lightweight internal About, Security, Contact, Help, GST Resources, API Docs, Terms, and Privacy pages
- Label landing-page metrics as illustrative demo/sample figures rather than verified business results
- Improve responsive layouts at 360, 390, 768, 1024, and 1440 px without replacing working screens
- Make invoice collection more actionable with clearer status distinctions, client/status search and filtering, due-soon visibility, and an obvious next action
- Clarify new-invoice requirements, validation messages, and live totals while avoiding unverified GST-compliance claims
- Keep reminder, payment, email, export, and support interactions explicitly in demo/test mode with no external side effects

## User flow

1. A visitor lands on the public homepage and understands that the visible metrics are demo examples.
2. The visitor explores pricing, calculators, FAQ, and the internal informational/footer pages.
3. The user enters the demo workspace through the existing demo login.
4. The workspace overview highlights consistent invoice totals and the agency’s collection priorities.
5. The user opens invoices, searches by client or status, filters paid/pending/due-soon/overdue records, and sees the sensible next action for each row.
6. The user creates a draft invoice, receives clear validation guidance, and sees totals update without creating an external payment or reminder.
7. The same flows remain usable on narrow mobile screens and balanced on desktop screens.

## UI/UX feel

- Keep the current blue, slate, white, and emerald collectFlow identity, typography, rounded surfaces, and glassy navigation treatment
- Use compact agency-friendly density in the workspace and generous left-aligned spacing on public pages
- Favor clear labels and action-oriented status language over decorative claims
- Preserve touch-friendly controls, readable financial figures, and non-clipped mobile layouts
- Use “Demo workspace sample” or equivalent labeling wherever seeded figures could be mistaken for verified results
- Make unavailable or demo-only destinations explicit instead of leaving silent placeholder links

## Implementation phases

### Phase 1 — MVP improvements (built now after approval)

- Resolve the verified count, pricing recommendation, interest-calculator, footer-link, and metric-label inconsistencies
- Add the lightweight internal informational pages
- Improve invoice statuses, filters, search, next-action guidance, and new-invoice clarity
- Apply responsive fixes to the named public, auth, dashboard, invoice, and form surfaces
- Verify the requested viewport widths and the main demo flows without entering real customer or payment information

### Phase 2 — Collection workflow refinement

- Add a richer agency collection queue with due-date grouping, client-level rollups, and demo follow-up history
- Improve invoice detail presentation, client context, and print/export previews while keeping all side effects mocked
- Add more focused empty states and recovery guidance for partial or unavailable demo data

### Phase 3 — Future production readiness

- Revisit real authentication, payment providers, outbound reminders, and durable multi-user persistence only when credentials, compliance requirements, and product decisions are supplied
- Replace illustrative metrics and demo-only actions with verified product data and audited claims

## Assumptions

- The current app is improved in place; working screens and existing design primitives are reused rather than replaced.
- Footer destinations will be lightweight internal pages, not third-party destinations.
- Existing landing metrics remain visible but are labeled as illustrative demo/sample figures.
- The overdue-interest calculator defaults to an editable 18% example estimate, with no claim that it is current and no legal or tax advice framing. The user-entered rate is the source of the calculation unless a verified source and effective date are supplied.
- Existing seeded demo data remains the only data used for development and testing; no real customer, payment, or credential data is entered.
- Authentication, reminders, payments, exports, support, and backend business persistence remain MOCKED/local demo behavior in this phase.
- No paid service, public deployment, GitHub push, credit purchase, or plan upgrade is included.
- Work stays within the stated 90-credit limit; if the complete phase cannot fit, the verified inconsistencies and highest-impact responsive/collection fixes take precedence.