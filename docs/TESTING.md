# StudySpot testing

## Frontend tests (implemented)

The frontend suite uses Vitest, jsdom, and React Testing Library. It runs in mock mode without a backend.

From `client/`:

```sh
npm test
```

Coverage currently includes:

- Fresh/stale report calculation and latest-report selection.
- Combined directory search and filter behavior.
- Mock report creation and history persistence.
- Mock space creation and deactivation while retaining reports.
- Login, registration, and report form validation.
- Protected and moderator route access.
- Moderator dashboard scrolling and create/edit form selection.

Build verification:

```sh
npm run build
```

## Backend API tests (implemented)

The report API suite runs from the repository root with:

```sh
npm --prefix server test
```

The tests use `mongodb-memory-server` and Supertest; they do not connect to a development or production database. They cover authentication, study-space CRUD and moderator authorization, input and ID validation, directory filters, deactivation with retained reports, report creation and validation, report history and pagination, safe reporter population, latest-report selection, and freshness boundaries/configuration using `STATUS_STALE_AFTER_MINUTES` (default `60`).

Authentication and moderator authorization are exercised against the production middleware and routes. The report module also has isolated route tests using test-only authenticated users.

## End-to-end testing (planned)

Add a browser-level smoke flow for member login/report submission and moderator space management when an end-to-end environment is available. The frontend suite can still be verified independently in mock mode with `npm test` and `npm run build`.
