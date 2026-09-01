# Webhooks overview

POST notifications to your callback when subscribed events occur.

Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/webhook](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)

Envelope: `eventId`, `eventTime` (ISO8601), `eventType`, `meta.userId`, `meta.resourceType`, `meta.resourceId`, `meta.instanceId`, `meta.resourceRef`, optional `meta.payload` (when extraPayload requested). `correlationId` = triggering `x-correlation-Id`.

`eventId` “ensures events are only digested once.”

Subscriptions: `/webhook/v1/subscriptions`. Resources: `GET /webhook/v1/resources` (machine list includes Loan, Document, Task, SubTask, TaskComment, TaskGroup, EnhancedConditionTemplate/Type, DocumentOrder, DocumentDelivery, InternalUsers, ExternalUsers, ExternalOrganization, UserGroup, Timer, Trade, ServiceOrder, Transaction, EFolder, DataSource, Analyzer*, ReceivedMailItem, …).

Signing: `Elli-Signature` HMAC-SHA256 Base64 of body; `Elli-SubscriptionId`; `Elli-Environment` always `prod` in docs. signingkey 32–64 chars complexity rules.

Auto-delete: subscriptions >30 days, >1000 events/week, undeliverable, 5xx/timeouts.

Retry schedule: **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** beyond “not guaranteed real-time” and lock/unlock retry caveat.

Not guaranteed ordered/instant.
