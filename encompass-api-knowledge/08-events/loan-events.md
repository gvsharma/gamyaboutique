# Loan webhook events

Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)

| Event | Trigger (official) | Support |
| ----- | ------------------ | ------- |
| create | New loan started | API |
| update | Update to loan file | Smart Client, API |
| submit | Consumer Connect Submit | ECC |
| move | Folder move including Trash | SC, API |
| document | create/update/assignAttachments | API |
| attachment | attachmentCreated | API |
| condition | Enhanced condition subevents | API |
| reportingdbupdate | Internal | N/A |
| milestone | updateMilestones, finishMilestones | API |
| milestoneupdate | Internal | N/A |
| change | Filtered attributes | SC, API |
| fieldchange | Filtered fields | API |
| enhancedfieldchange | create/change with previous+new | API (ticket) |
| delete | Permanent delete | SC, API |
| lock / unlock | Exclusive lock | SC, API; not guaranteed RT |
| alertchange | Compliance alerts Limited Availability | SC, API |
| disclosureTracking | Enhanced DT log Beta | API |

Dashboard: invalidate Redis loan + HLA index on create/update/move/delete; milestone column on milestone; lock column on lock/unlock (reconcile because of delay).
