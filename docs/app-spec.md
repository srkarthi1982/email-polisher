# App Spec: email-polisher

## 1) App Overview
- **App Name:** Email Polisher
- **Category:** Writing / Communication
- **Version:** V1
- **App Type:** Local-only
- **Purpose:** Provide a public structured email-drafting workspace with tone controls, variant editing, copy actions, and local draft persistence.
- **Primary User:** A single user drafting emails locally in the browser.

## 2) User Stories
- As a user, I want to enter email basics and tone preferences, so that I can structure a message quickly.
- As a user, I want to switch between Draft A, B, and C, so that I can compare alternative email versions.
- As a user, I want to copy the current draft or all variants and reset the workspace, so that I can reuse the tool for multiple emails.

## 3) Core Workflow
1. User opens `/app`.
2. User fills in subject, recipient, sender, context, tone, and refinement controls.
3. User edits the active draft variant and watches the live preview update immediately.
4. User switches between Draft A/B/C to compare or maintain different versions.
5. User copies the current draft or all variants and resets the local workspace when starting over.

## 4) Functional Behavior
- The app is public and local-only in V1; there is no backend, auth gate, or DB persistence.
- Draft basics, tone selection, refinement toggles, and variant content update the visible preview immediately.
- Copy actions export formatted email text based on the currently visible draft state.
- Invalid routes return a safe `404` without crashing the workspace.

## 5) Data & Storage
- **Storage type:** `localStorage`
- **Main entities:** Email workspace basics, tone, refinement flags, Draft A/B/C content
- **Persistence expectations:** The current local draft persists across refresh in the same browser until reset.
- **User model:** Single-user local

## 6) Special Logic (Optional)
- The app is not an AI rewriting service in the current implementation; the user manually edits the three draft variants.
- Copied output includes subject, tone, refinement labels, greeting, and current variant content exactly as formatted by the preview logic.

## 7) Edge Cases & Error Handling
- Invalid IDs/routes: Unknown routes such as `/app/not-a-number` return `404`.
- Empty input: Blank fields remain in placeholder-style preview output and do not crash the app.
- Unauthorized access: Not applicable in V1 because `/app` is public.
- Missing records: Not applicable because there is no saved-record detail route in V1.
- Invalid payload/state: Reset clears the local workspace back to the default draft state.

## 8) Tester Verification Guide
### Core flow tests
- [ ] Fill the email basics and draft content, then confirm the live preview updates immediately.
- [ ] Switch between Draft A/B/C, copy the current email and all variants, and confirm clipboard output matches visible content.

### Safety tests
- [ ] Refresh the page and confirm the draft persists from local storage.
- [ ] Trigger reset/new draft and confirm all draft fields are cleared.
- [ ] Visit an invalid route and confirm the app returns `404` without runtime errors.

### Negative tests
- [ ] Confirm there is no saved draft list, detail route, or DB-backed user history in V1.
- [ ] Confirm blank fields and draft switching do not produce console/runtime crashes.

## 9) Out of Scope (V1)
- Authenticated user accounts
- Server or DB persistence
- AI-generated rewrites or shared collaboration

## 10) Freeze Notes
- V1 release freeze: this document reflects the verified public local drafting workflow.
- Freeze Level 1 verification confirmed basics entry, tone/refinement controls, Draft A/B/C switching, live preview, copy actions, refresh persistence, reset behavior, and invalid-route safety.
- During freeze, only verification fixes and cleanup are allowed; no undocumented feature expansion.
