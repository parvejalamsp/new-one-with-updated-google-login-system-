# collectFlow Collection Workflow and Google Sign-In Plan

collectFlow is an invoice and payment-follow-up workspace for agencies managing multiple client accounts.
This release turns the current demo into a more useful client-first collection experience and replaces mock login with Emergent-managed Google sign-in, while keeping financial actions and business data local and demonstrative.

## Who it's for

- Agencies, studios, consultants, and service businesses that manage unpaid invoices across multiple clients.
- Owners and finance operators who need to understand client-level exposure and decide the next collection action.
- Prospective users evaluating collectFlow through a safe demo workspace without real payments, reminders, or shared production records.

## Core features and experience

- Preserve the existing collectFlow marketing pages, calculators, pricing, FAQ, informational pages, and responsive behavior.
- Replace the mock login button with real Emergent-managed Google sign-in.
- Restore active sessions, protect workspace routes, show the signed-in user's identity, and provide a clear sign-out action.
- Keep public marketing pages accessible without signing in; require Google sign-in to enter the collection workspace.
- Organize the agency collection queue by client first, with invoices and due dates shown within each client group.
- Show client rollups for total outstanding, overdue amount, invoice count, and the next recommended action.
- Improve invoice details with client context, collection state, amounts, dates, and follow-up activity.
- Let users add, edit, and mark mocked follow-ups complete without sending external messages.
- Preview invoice documents and collection summaries, then use clearly mocked print and download actions.
- Provide purposeful empty states and recovery guidance when demo data is empty, filtered out, incomplete, or unavailable.
- Keep payments, outbound reminders, document delivery, and backend business persistence mocked or local-only.

## User flow

1. A visitor explores the public collectFlow site without authentication.
2. The visitor chooses to enter the workspace and reaches a dedicated Google sign-in screen.
3. Successful Google sign-in returns the user to the collection workspace; cancelled or failed sign-in shows a clear retry path without bypassing authentication.
4. A returning user with a valid session goes directly to the workspace instead of signing in again.
5. The workspace displays client groups with outstanding totals, overdue exposure, invoice counts, due-date signals, and next actions.
6. The user opens a client group, reviews its invoices, and opens an invoice for full collection context.
7. The user adds or edits a mocked follow-up and marks it complete when appropriate.
8. The user previews an invoice or collection summary and invokes a mocked browser print or local download action.
9. If the demo has no usable data, the interface explains why and offers a safe reset, return, or clear-filter action.
10. The user signs out from the workspace identity menu and returns to the public experience.

## UI/UX feel

- Maintain the existing collectFlow visual identity across marketing, authentication, and workspace screens.
- Present Google sign-in on a dedicated responsive page rather than a cramped modal.
- Brand the managed sign-in surface to feel consistent with collectFlow while preserving the provider's complete and secure sign-in flow.
- Keep the Demo Workspace visibly labeled so real identity is not confused with production-grade business persistence.
- Use client grouping as the queue's dominant structure; due dates and urgency remain supporting prioritization signals.
- Make outstanding totals, overdue amounts, invoice counts, and next actions quickly scannable.
- Keep follow-up interactions compact and explicit about being mocked, with concise success and error feedback.
- Make previews document-like and clearly distinguish preview, print, and download actions.
- Ensure all primary queue, invoice, follow-up, authentication, and recovery flows remain practical on mobile and desktop.

## Implementation phases

### Phase 1 — Collection workflow MVP and Google sign-in — built now

- Add Emergent-managed Google-only sign-in and replace the existing mock authentication entry points.
- Protect workspace routes, restore sessions, show signed-in identity, and support sign-out.
- Add a client-first collection queue with nested invoices and visible due-date and overdue signals.
- Add client rollups for total outstanding, overdue amount, invoice count, and next action.
- Improve invoice details with client context and collection activity.
- Add local demo follow-up history with create, edit, and complete actions.
- Add invoice and collection-summary previews with mocked print and download behavior.
- Add empty, filtered, partial-data, and unavailable-demo recovery states.
- Keep all collection data and side effects local or mocked; no real payment, reminder, or document delivery occurs.

### Phase 2 — Workflow intelligence and operational refinement — future

- Add configurable queue views, saved filters, follow-up scheduling, and richer client-level activity rollups.
- Add broader export formats, batch preview workflows, and clearer prioritization explanations.
- Refine cross-device continuity after durable data persistence becomes available.
- Evaluate optional agency roles and permissions only after access requirements are defined.

### Phase 3 — Production readiness — future

- Move invoice, client, and follow-up data from local storage to durable, account-scoped backend persistence.
- Enforce authenticated ownership and any approved role permissions on every business-data request.
- Integrate real payment providers and outbound reminder delivery.
- Add auditable document generation, operational monitoring, and production recovery behavior.
- Replace illustrative metrics and recommendations with verified product data and approved business rules.

## Assumptions

- Google is the only sign-in method in this release; email/password login is not included.
- Emergent-managed authentication supplies and manages the required provider configuration, so the user does not need to provide Google or Clerk credentials.
- No admin or member roles are needed yet; every authenticated user has the same demo-workspace capabilities.
- Public marketing and informational routes remain available while signed out; workspace routes require a valid session.
- The current local demo dataset is separated by signed-in account on the same browser where practical, but is not synchronized across devices.
- Signing out does not delete local demo data; returning with the same account restores that account's local workspace on that browser.
- Authentication is real, but invoices, clients, follow-ups, exports, payments, and reminders remain demo-only in this phase.
- Print uses the browser's print experience; download creates a local demo document or export and does not create a server-side record.
- “Next action” remains an illustrative recommendation derived from demo invoice state, not financial or legal advice.
- If managed authentication is unavailable, the workspace stays protected and presents retry guidance rather than falling back to mock access.
- Preview and published authentication environments may have separate user registrations; a preview sign-in does not guarantee an existing production account.