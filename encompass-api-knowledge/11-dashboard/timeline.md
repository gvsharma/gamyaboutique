# Loan timeline (INTERNAL ARCHITECTURE RECOMMENDATION)

Compose chronologically:

- Milestone History (system log) + milestone webhooks
- Conversation logs + comments
- Condition tracking entries
- Document/attachment events
- Disclosure tracking logs
- Task comments
- auditTrail for watched fields
- Your stored webhook eventTime

ICE does not ship a single “timeline” API. **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION**
