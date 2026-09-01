# Document delivery

`GET /delivery/v3/{groupNamespace}/{groupId}/packages` — `groupNamespace=loans`, `groupId`=loan GUID. `view=pipeline` reduces fields to packages for current user. Cancelled-due-to-default excluded.

`GET .../packages/{packageId}`

Added 24.2/24.3. Webhooks: packageCreated, packageUpdated; fulfillmentCreated/Updated **Limited Availability**. Extra payload includes fulfillmentStatus, signedDate, completedDate, recipient task timestamps.

Source: get-packages, wbhks-re-cat-doc-delivery
