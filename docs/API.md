# StudySpot API

This document describes the client API contract and implementation status. Authentication, study-space, and availability-report endpoints are implemented.

## Conventions

- Base URL: `http://localhost:5000/api`.
- JSON request and response bodies.
- Successful resources use `{ "success": true, "data": ... }` envelopes.
- Errors use `{ "success": false, "message": "..." }`.
- Authenticated endpoints should use `Authorization: Bearer <token>`. Moderator permissions must be enforced by the server.
- IDs are represented as strings. The mock client uses stable strings; production database IDs may require normalization.
- Dates are ISO 8601 timestamps.

## Authentication

### `POST /api/auth/register`

Request:

```json
{
  "name": "Avery Morgan",
  "email": "avery@example.edu",
  "password": "example-password",
  "confirmPassword": "example-password"
}
```

Success response (`201`):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "Avery Morgan",
      "email": "avery@example.edu",
      "role": "member"
    },
    "token": "issued-token"
  }
}
```

Public registration does not accept a moderator role. The server requires a name of 2–80 characters, a valid email address, a password of 8–72 characters, and a matching `confirmPassword`.

### `POST /api/auth/login`

Request:

```json
{
  "email": "avery@example.edu",
  "password": "example-password"
}
```

Success response (`200`) uses the same `{ "success": true, "data": { "user": ..., "token": ... } }` shape as registration. JWTs expire after one day (`1d`). Refresh and revocation are not implemented.

## Study spaces

Study-space representation:

```json
{
  "id": "space-id",
  "name": "Central Library",
  "building": "Main Block",
  "area": "Level 2 · East Wing",
  "description": "A bright reading floor.",
  "facilities": ["Power outlets", "Wi-Fi"],
  "quietZone": true,
  "groupStudyAllowed": false,
  "active": true
}
```

### `GET /api/spaces`

Returns active spaces by default, ordered by name. `includeInactive=true` is moderator-only. Supported query parameters:

| Parameter | Proposed meaning |
|---|---|
| `search` | Match space name, building, area, or description |
| `building` | Filter by building |
| `area` | Filter by area |
| `quietZone` | `true` or `false` |
| `groupStudyAllowed` | `true` or `false` |
| `facility` | Include spaces that have this facility |
| `status` | Filter by latest report status |

Response: `{ "success": true, "data": { "spaces": [/* space objects */] } }`. A space contains the fields shown above, its string `id`, and `createdAt`/`updatedAt` timestamps.

### `GET /api/spaces/:id`

Returns one active space as `{ "success": true, "data": { "space": {/* space object */} } }`. Invalid IDs return `400`; missing or inactive spaces return `404`.

### `POST /api/spaces`

Moderator only. Request contains the space fields above except `id` and timestamps. `active` defaults to `true`. Response is `201` with `{ "success": true, "data": { "space": {/* created space */} } }`.

### `PATCH /api/spaces/:id`

Moderator only. Request may contain any non-empty subset of editable space fields. Response is `200` with `{ "success": true, "data": { "space": {/* updated space */} } }`.

### `DELETE /api/spaces/:id`

Moderator only. This action sets `active` to `false` rather than deleting the document, preserving report history. Response is `200` with `{ "success": true, "data": { "space": {/* inactive space */} } }`.

## Reports

Proposed report representation:

```json
{
  "id": "report-id",
  "spaceId": "space-id",
  "reporterId": "user-id",
  "reporterName": "Avery M.",
  "status": "Available",
  "note": "Several desks are free.",
  "reportedAt": "2026-10-29T10:00:00.000Z",
  "createdAt": "2026-10-29T10:00:00.000Z"
}
```

Supported status strings in the current frontend are `Available`, `Moderately Busy`, `Busy`, and `Temporarily Closed`. Freshness is derived from `createdAt` by the client and is not a fifth report status.

### `GET /api/spaces/:id/reports`

Returns report history ordered newest first as `{ "success": true, "data": { "reports": [...], "pagination": { "page": 1, "limit": 10, "totalReports": 1, "totalPages": 1 } } }`. Query parameters are `page` (default `1`) and `limit` (default `10`, maximum `100`). Reports include `reportedAt`, backend-calculated `freshness`, the backend's `freshnessThresholdMinutes`, and the frontend-compatible `createdAt`, `id`, and `reporterName` fields. `reporterId` is populated with only `_id` and `name`.

### `POST /api/spaces/:id/reports`

Authenticated member or moderator. Request:

```json
{
  "status": "Available",
  "note": "Several desks are free."
}
```

The note is optional and limited to 300 characters; surrounding whitespace is trimmed and a blank note is omitted. Reporter identity and timestamp are derived on the server. The implemented success response is `201` with `{ "success": true, "data": { "report": {/* report object */} } }`. Each submission creates a separate report document.

### `GET /api/spaces/:id/reports/latest`

Returns the latest report and its computed freshness as `{ "success": true, "data": { "report": {/* report object */}, "status": "Available", "reportedAt": "2026-10-31T08:00:00.000Z", "freshness": "Fresh" } }`. Freshness is `Fresh`, `Stale`, or `No Report`; reports become stale at an age greater than or equal to `STATUS_STALE_AFTER_MINUTES` (default `60`). With no reports, `report`, `status`, and `reportedAt` are `null`, and `freshness` is `No Report`. The report's original status is not modified.

## Remaining API decisions

- Pagination for the study-space directory.
- JWT refresh/revocation and how the frontend restores sessions.
- Whether inactive report history should remain publicly readable.
- Reporter display-name/privacy policy.
- Rate limiting and abuse prevention for community reporting.
