# Personas

`GET /encompass/v3/settings/personas` — id, name, default-access, internal/external, display order. Query `personaType`, `start` (0), `limit` (default 100, **max 1000**).

`GET /encompass/v3/settings/personas/{id}` — access rights; `categories` filter (Pipeline, EFolder, Loan, …).

API key does not override persona. Pipeline admin persona is faster. Archive access is a Pipeline persona right.

Source: get-a-list-of-personas-1
