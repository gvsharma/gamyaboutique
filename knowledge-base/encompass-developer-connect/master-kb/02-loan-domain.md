# 02 — Loan domain

**Related:** [03 Schema and fields](./03-loan-schema-and-fields.md) · [13 Webhooks](./13-webhooks-events.md) · [11 Comments](./11-conversation-logs-notes-comments.md)

**Official:** [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) · [V3 Get Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-1) · [Loan Resource Lock](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-lock-1)

---

## A. Business meaning

The **loan** is the mortgage transaction and its structured data. Everything else (people, workflow, documents, conditions, disclosures) hangs off this identity.

It is **current state plus related logs**, not a single flat “application form.”

## B. Real mortgage example (illustrative)

John Smith’s file is one loan:

- Purchase of a $500,000 property
- $400,000 conventional 30-year note
- Application pair: John (borrower); co-borrower only if present
- Mike is loan associate in the Loan Officer role
- Sarah is loan associate in the Processor role

The **loan number** operations staff quote on the phone is not necessarily the same as `loanId`. `loanId` is the API GUID. Mapping of “loan number” field ID/path: confirm in the current [V3 Loan Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1). Do not invent the field name here.

## C. Domain model

```text
Loan (loanId)
 |
 +-- applications[]  (borrower pairs)
 |     +-- borrower / coborrower
 |           +-- employment, income, assets, liabilities, ...
 +-- property
 +-- custom fields
 +-- contacts
 +-- associates (people on roles)
 +-- milestones
 +-- conditions (standard XOR enhanced — see indicator)
 +-- documents / attachments (eFolder)
 +-- editable logs (e.g. Conversation Logs, AUS Tracking)
 +-- system logs (e.g. Milestone History, HTML Email, Lock Action)
```

## Four truths you must keep separate

| Kind | What it is | How you get it |
|------|------------|----------------|
| **Current state** | Loan data now | `GET .../loans/{loanId}?view=entity` (or specific entity APIs) |
| **Editable log / history** | User-maintainable log entries | `view=log` or `full`, and/or dedicated log APIs |
| **System-generated history** | Not user-editable | `view=log` or `full` if present |
| **Field-change events** | Notifications of what changed | Webhooks `change`, `fieldchange`, `enhancedfieldchange` — **not** current state |

**Documented entity classes (V3):**

1. **Fixed collections**
2. **Variable collections** (examples: VoDs, VoLs, VoEs) with three location patterns
3. **Editable logs** (examples: AUS Tracking Logs, Conversation Logs) — generally without Encompass Field IDs; included in Get Loan with `view=logs|full`
4. **System logs** — cannot be edited by any user; examples: Milestone History Log, HTML Email logs, Lock Action Logs; included with `view=logs|full`

Source: [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management).

ICE writes `view=logs` in the entity-class notes and `View=log` in the views list. Treat the exact query-parameter spelling as something to confirm on the current Get Loan page (`log` vs `logs`). **Do not guess in code.**

## D. API (documented)

| Operation | Version | Endpoint |
|-----------|---------|----------|
| Get loan | V3 | `GET /encompass/v3/loans/{loanId}` |
| Create / update | V3 | See Create Loan / Update Loan pages — different contract from V1 |
| Lock | V1 and V3 lock APIs | [Loan Resource Lock](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-lock-1) |

**Locks (documented):**

- Resource locks provide consistency when multiple clients access the same loan.
- A session-less lock is applied automatically for a **single** API call.
- Hold a lock across **multiple** calls only when required.
- When a loan is locked, resources within the loan (contacts, eFolder, etc.) inherit that lock.
- V3 lock types: `exclusive`, `NGSharedLock` (and NGShared with restrictions for desktop shared lock).
- V1 lock types: `exclusive`, `shared`.
- Exclusive lock: logged-in user has exclusive write; others can read but not update/delete.
- Shared lock: allows API updates while a user has the loan open; exclusive lock cannot be obtained while shared is held.
- Desktop “Shared Loan Lock” can restrict some operations (create/delete borrower pair, swap/move borrowers) while the loan is open in desktop (`restricted`).

## E. Request

```http
GET /encompass/v3/loans/{loanId}?view=entity
Authorization: Bearer {accessToken}
Accept: application/json
```

Illustrative: fetch John Smith’s current application data without logs.

For writes, pass `lockId` when you acquired a multi-call lock. Many PATCH APIs document `lockId` as a query parameter.

## F. Response

**Illustrative payload based on documented contract** (not copied from a live loan; property names must be taken from the current schema):

```json
{
  "id": "a07c3604-555d-4553-9de7-5b3e87b6bce0",
  "useEnhancedConditionIndicator": true,
  "applications": [
    {
      "id": "{applicationId}",
      "borrower": {
        "firstName": "John",
        "lastName": "Smith"
      }
    }
  ]
}
```

Exact JSON paths for name, loan amount, property value: **confirm in V3 schema**. Field ID `ENHANCEDCOND.X1` / path `loan.useEnhancedConditionIndicator` **is documented**.

Permission rule **documented:** if you lack permission to a requested field, it is not returned.

## G. Views (documented)

| View | Returns | When a bank should use it |
|------|---------|---------------------------|
| `entity` | Everything in the loan file **other than** log entries | Default operational read |
| `log` | **Only** log entries | Communications/history harvest |
| `full` | Content **and** logs — **largest payload; not recommended for general use** unless log detail is required | Rare: you truly need both in one call |
| `id` | IDs of created/updated resources; **only available on create/update APIs** | Write responses |

Do **not** blindly request `full`.

## H. Lifecycle

Loan create → data entry → workflow → lock/unlock during edits → folder move (including trash as **documented** soft-delete signal on `move`) → optional permanent `delete` event.

**Documented loan webhook events** (see [13](./13-webhooks-events.md)): `create`, `update`, `submit` (Consumer Connect Submit button only), `move` (includes soft delete if moved to trash), `document`, `attachment`, `condition` (Enhanced Conditions subevents), `milestone`, `change`, `fieldchange`, `enhancedfieldchange`, `delete`, `lock`, `unlock`, plus limited/beta: `alertchange`, `disclosureTracking`. Internal-only: `reportingdbupdate`, `milestoneupdate` — do not treat as supported product events.

## I. Events

Default webhook attributes **documented:** `eventId`, `eventTime`, `eventType`, `meta.userId`, `meta.resourceType`, `meta.resourceId`, `meta.instanceId`, `meta.resourceRef` (URL to fetch the full resource).

After an event, if downstream state must be correct: **GET the current loan** (`view=entity` or a specific entity). Especially for EFC: previous/new values can be overtaken.

## J. Integration architecture

Projection tables keyed by `loanId`. Raw webhook store keyed by `eventId`. Never use EFC as the only writer of “current loan.”

## K. Production concerns

- **Concurrency:** use documented lock types; handle already-locked errors; ICE states lock webhooks do **not** eliminate retries.
- **Stale data:** webhooks are delayed.
- **PII:** loan entity and EFC payloads include borrower data (official EFC sample includes an SSN-shaped newValue — treat as PII).
- **Pagination:** Get Loan is a single resource GET; pipeline/list APIs are separate — do not assume Get Loan is paginated.
- **V1 vs V3:** different contracts; `legacyId` appears on some application references when the loan was created with V1.

## L. Common mistakes

1. Using V1 JSON against V3 endpoints.
2. `view=full` in a hot path.
3. Ignoring `useEnhancedConditionIndicator`.
4. Treating `move` to trash as hard delete (`delete` is the permanent-delete event).
5. Assuming `submit` fires for every origination channel (documented as Consumer Connect Submit button).

## M. Questions

1. What is `loanId` vs loan number?
2. When do you take an exclusive vs shared/NGShared lock?
3. Why might a field be missing from Get Loan besides “it is empty”?
4. How do you reconcile EFC with a later GET?
