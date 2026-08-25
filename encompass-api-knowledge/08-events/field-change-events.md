# Field change events

**change** — JSON path filters; OR across attributes. Added ~2018.

**fieldchange** — filter fields; payload includes subject field plus downstream updated fields; subject need not be in Audit Trail DB.

**enhancedfieldchange** — previous + new values; virtual fields need RDB inclusion; enable via support ticket + subscribe; GA 24.2; loan create payload large / possibly multipart.

Concurrency guide: EFC “ALREADY includes the changed data” — prefer over Get Loan.

Sources: wbhks-re-cat-loan, efc-webhook-how-to-enable, efc-webhook-features-and-usage-notes, concurrency-limits
