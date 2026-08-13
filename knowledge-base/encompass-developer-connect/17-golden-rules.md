# 17 — Golden Rules

**Share this file when:** reviewing designs, pull requests, or vendor proposals.

**Related:** [README](./README.md) · [01 Core model](./01-purpose-and-core-model.md) · [18 Official documentation](./18-official-documentation.md)

---

These rules are non-negotiable for a long-lived Encompass Developer Connect knowledge base and bank integration.

1. **Never hardcode lender-configurable workflow.** Milestone names, condition statuses, templates, and roles vary by Encompass configuration.

2. **Never assume one user equals one role.** Users, personas, roles, groups, and loan associates are distinct. Multi-role assignment is possible; policy may still forbid it.

3. **Never treat a condition as a document.** A condition is a requirement. Documents are evidence that may be assigned to it.

4. **Never treat a document as the actual file; distinguish document and attachment.** The eFolder document is a business record. The attachment is the electronic file.

5. **Never model a condition as only a boolean.** Conditions have identity, type, status, dates, owner, comments, tracking, and assigned documents.

6. **Never assume a webhook is the authoritative current state.** Validate, persist, queue, and fetch the resource when downstream truth matters.

7. **Never assume event delivery is perfectly ordered or instantaneous.** Design for delay, duplication, and out-of-order arrival.

8. **Never assume one event equals one business action.** One save can emit many field changes or multiple resource events.

9. **Never assume there is one API that returns every comment/history item.** Aggregate conversation logs, object comments, tracking, and system logs.

10. **Never mix V1 and V3 contracts without explaining the difference.** They are different data contracts.

11. **Never invent undocumented fields or status values.** If it is not in current ICE docs or the configured instance, do not put it in code as a platform fact.

12. **Treat PII and audit/history as first-class architecture concerns.** Field-change payloads, logs, and raw event stores need retention, encryption, and access control.

13. **Design for retries and duplicates.** Idempotency keys (event IDs) are mandatory.

14. **Persist raw events when audit/replay requirements justify it.** Raw store and current-state store have different jobs.

15. **Use official ICE documentation as the source of truth.** This knowledge base is a domain seed. Link and re-verify docs as ICE releases change.

## One-line memory aid

```text
Milestone = where
Task      = work
Condition = requirement
Document  = evidence record
Attachment= file
Webhook   = notification, not truth
```
