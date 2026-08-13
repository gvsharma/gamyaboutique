# Domain Glossary

Terms used across this knowledge base, aligned to Encompass Developer Connect official documentation where available.

---

## A

**Application** — A borrower pair on a loan file. Entity type `Application`. Contains borrower, optional co-borrower, property, and application-scoped financial collections.

**Asset** — Borrower asset verified via VODs (Verification of Deposit) and related loan schema entities.

**Associate** — See **Loan Associate**.

**Attachment** — Electronic file in the eFolder. Can be assigned to exactly one document at a time. Entity type `Attachment`.

**AUS Tracking Log** — Editable log for automated underwriting system runs.

**Automated Conditions** — Enhanced Conditions applied by business rules; evaluated via `/encompass/v3/calculators/automatedConditions`.

---

## B

**Borrower** — Primary applicant on an application. Entity type `Borrower`.

**Borrower Contact** — CRM contact separate from loan applicant. Has dedicated notes API.

**Business Contact** — Transaction party (title, escrow, etc.). Entity type `BusinessContact`.

---

## C

**Category (Condition)** — Condition classification (Assets, Credit, Income, etc.). **LENDER CONFIGURABLE**.

**Co-Borrower** — Secondary applicant. Entity type `CoBorrower`.

**Comment** — Contextual annotation on a resource (condition, document, task, milestone, conversation log). Uses `LogCommentContract` in many APIs.

**Condition** — eFolder entry tracking a loan requirement. Not a document or task.

**Condition Instance** — Runtime condition on a loan (EnhancedConditionContract).

**Condition Set** — Group of condition templates applied together. Settings: `/encompass/v3/settings/loan/conditions/set`.

**Condition Template** — Admin-defined reusable condition blueprint. Settings: `/encompass/v3/settings/loan/conditions/templates`.

**Condition Type** — Classification (Preliminary, Underwriting, Post-Closing). Settings: `/encompass/v3/settings/loan/conditions/types`.

**Conversation Log** — Editable loan log tracking communications with customers, partners, vendors; supports follow-up alerts.

**Custom Attributes (Task)** — Opaque JSON name/value pairs on workflow tasks; not indexed for search.

---

## D

**DDA (Data & Document Automation)** — Formerly AIQ. Automation platform; limited webhook availability.

**Days To Receive** — Enhanced condition field: expected days to receive satisfying documentation.

**Disclosure** — Regulatory disclosure (LE, CD, etc.) tracked for TRID compliance.

**Disclosure Tracking (2015)** — API/log type for RESPA-TILA timelines on loans originated on/after Oct 3, 2015.

**Document** — eFolder container tracking a loan document. Entity type `Document`. Not the same as attachment.

**Document Delivery** — Sending generated document package to recipients via Encompass Docs delivery APIs.

**Document Order** — Workflow to generate disclosure/closing packages (`/encompassdocs/v1/documentOrders/...`).

**Document Package** — Collection of forms/documents in a generation/delivery order.

---

## E

**eFolder** — Encompass electronic document folder on a loan.

**EFC (Enhanced Field Change)** — Webhook event type `enhancedfieldchange` with previous/new field values.

**Employment** — Borrower employment history; VoE entities for verification.

**Enhanced Conditions** — Condition model introduced Encompass 20.2 with field-level customization and cross-loan reporting.

**EntityReferenceContract** — Standard reference object with `entityId`, `entityName`, `entityType`, `entityUri`.

**EPC (Encompass Partner Connect)** — Partner integration platform; dedicated webhook category.

**Event** — See **Webhook Event**.

**External Description** — TPO-facing condition text.

**External User** — TPO/broker user outside lender organization.

---

## F

**Field Change** — Mutation to a loan data field; notified via `fieldchange` or `enhancedfieldchange` webhooks.

**Fixed Collection** — Loan schema collection with fixed size; items cannot be deleted, only emptied.

---

## I

**Income** — Borrower income sources under application/applicant variable collections.

**Internal Description** — Staff-facing condition text.

**Instance ID** — Encompass environment identifier in webhook `meta.instanceId`.

---

## L

**Liabilities** — Borrower debts; VOLs for verification.

**Loan** — Root aggregate representing the mortgage transaction and all associated data.

**Loan Associate** — User or group assigned to a role on a specific loan.

**Loan ID (loanId)** — Permanent 32-character GUID identifying the loan.

**LogCommentContract** — Standard comment structure with `comments`, `forRole`, `addedBy`, `addedDate`, etc.

---

## M

**Milestone** — Workflow stage defining activities and responsible role.

**Milestone Comment** — Text in milestone log `comments` field.

**Milestone History Log** — System log of milestone transitions; not editable.

**Milestone Setting** — System-configured milestone template. **LENDER CONFIGURABLE**.

**Milestone Task** — Encompass-native milestone task (distinct from Workflow Task).

**Milestone-Free Role** — Loan role not tied to any milestone.

---

## N

**Note** — Entity-specific annotation (borrower contact notes, trade notes). **Not** equivalent to conversation logs at loan level per official API surface reviewed.

---

## O

**Organization** — Company/branch hierarchy for users and settings.

**Owner (Condition)** — User/role responsible for clearing a condition.

---

## P

**Persona** — User capability profile controlling Encompass access. **LENDER CONFIGURABLE**.

**Prior To** — When a condition must be cleared (Approval, Docs, Funding, etc.). **LENDER CONFIGURABLE**.

**Property** — Subject property on an application.

---

## R

**Recipient (Condition)** — Entity receiving the condition. **LENDER CONFIGURABLE**.

**Requested From** — Person/entity condition is requested from (e.g., Borrower).

**Role** — Loan team function (LO, Processor, UW). **LENDER CONFIGURABLE**.

---

## S

**Scheduler** — Platform scheduling resource with webhook events.

**Source (Condition)** — System that created the condition (e.g., Fannie Mae).

**sourceOfCondition** — Read-only enhanced condition attribute describing creation mechanism (Manual, DUFindings, AutomatedByRule, etc.).

**Standard Conditions** — Legacy condition model when `useEnhancedConditionIndicator = false`.

**Subtask** — Child work item under a Workflow Task; not separately assignable.

**System Log** — Platform-generated, non-editable log (milestone history, HTML email, lock actions).

---

## T

**Task (Workflow)** — Assignable unit of work in Workflow Task Service (`/workflow/v1/tasks`).

**Task Instance** — Runtime workflow task (vs template).

**Task Pipeline** — Active incomplete tasks for a user/group.

**Task Template** — Admin-configured workflow task blueprint.

**Tracking (Condition)** — Status checkpoint entries on enhanced conditions.

**Trade** — Secondary marketing trade entity with dedicated APIs/notes.

---

## U

**User** — Internal or external Encompass user account.

**User Group** — Collection of users for assignment (e.g., Underwriting group).

**URN (EntityType)** — Uniform resource name for entity types in workflow task associations (e.g., `urn:elli:encompass:user`).

---

## V

**Variable Collection** — Loan schema collection with variable size; items can be added/removed/reordered.

**VoD** — Verification of Deposit.

**VoE** — Verification of Employment.

**VoL** — Verification of Liability.

---

## W

**Webhook** — Push notification from Encompass to subscriber endpoint on subscribed events.

**Workflow Task** — Modern task framework in Encompass Web; distinct from milestone tasks.

**Write Access (Associate)** — Whether loan associate can write on assigned milestone/role.

---

## Markers used in this knowledge base

| Marker | Meaning |
|--------|---------|
| **LENDER CONFIGURABLE** | Defined per lender in Encompass settings |
| **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** | Not verified in Developer Connect docs reviewed |

---

## References

- [Encompass Developer Connect](https://developer.icemortgagetechnology.com/developer-connect)
- [Domain Relationships](./domain-relationships.md)
