# Settings APIs (environment description)

These describe the Encompass **instance**, not a single loan:

Personas, organizations (internal via users, TPO external orgs), milestones settings, loan folders, custom fields, enhanced condition types/sets/templates, disclosure tracking settings, templates (loan program, closing cost, template set, SSP, ABA, transcript of tax), ICE PPE lookups if licensed.

Company/User Setup family: Milestones, Organizations, Personas, Roles.

**INTERNAL ARCHITECTURE RECOMMENDATION:** load at deploy / daily into config service; not per dashboard click.
