# StudySpot server

Authentication, study-space listing and moderator management, and availability report submission, history, latest-report retrieval, and freshness calculations are implemented.

## Planned stack

- Node.js and Express.js for the HTTP API.
- MongoDB with Mongoose for users, study spaces, and availability reports.
- bcrypt for password hashing and JWT for authentication.
- Role-based authorization for moderator-only study-space management.

## Planned responsibilities

- Register and authenticate users without exposing credentials or password hashes.
- Return normalized study-space and report data for the client API adapter.
- Support search and directory filters described in [../docs/API.md](../docs/API.md).
- Accept authenticated community reports, retaining reporter identity and timestamp.
- Restrict create, update, and deactivate operations to moderators.
- Preserve report history when a study space is deactivated.
- Validate all inputs and enforce authorization server-side; frontend route guards are not security controls.

## Report module integration

The report routes are mounted under `/api/spaces`. History and latest-status reads are public. The application passes the existing JWT authentication middleware to `createReportRoutes`; report submissions require an authenticated `member` or `moderator`.

The report module references Mongoose models named `StudySpace` and `User`. The study-space model exposes an `active` field (spaces without `active: false` are treated as active), and the user model exposes `name`. Reporter population explicitly selects only `name`. The `StudySpace` model is registered during app startup.

`STATUS_STALE_AFTER_MINUTES` controls freshness and defaults to `60`. Freshness is calculated when requested and is never stored in a report. A report becomes stale at the threshold; its original availability and report history remain unchanged.

## Environment and implementation status

The server loads its private configuration from `%LOCALAPPDATA%\\StudySpot\\server.env` on Windows (or `~/.config/StudySpot/server.env` elsewhere), then falls back to `server/.env` for standard local setups. Keep credentials out of tracked example files; `server/.env.example` contains placeholders only. The root [`.env.example`](../.env.example) is a template, not a secrets file. Database schema, token policy, error format, validation rules, and deployment settings remain to be decided when backend work begins.

The frontend works independently in mock mode; set `VITE_USE_MOCK_API=false` in the client environment to use the API. Backend tests use an isolated in-memory MongoDB and do not connect to the configured development database.

## Seed sample study spaces

From `server/`, run:

```powershell
npm run seed
```

The script loads the existing private server configuration (including `server/.env` as a fallback) and uses the existing MongoDB connection helper. It upserts five sample spaces into the Mongoose `StudySpace` collection (`studyspaces`) and one recent availability report per space into `spacereports`. Report statuses belong to `SpaceReport`, not `StudySpace`. A sample reporter user is also inserted if it does not already exist; its password hash is generated from a random, discarded value, so the seed account has no published login credentials.

The fixed document IDs make repeated runs update the same sample records instead of adding duplicates. To verify in MongoDB Atlas, select the database configured by the server, open `studyspaces`, and confirm that the five sample names are present. Check `spacereports` for their corresponding status values, and `users` for the sample reporter. The seed command prints a success summary without connection values or credentials.
