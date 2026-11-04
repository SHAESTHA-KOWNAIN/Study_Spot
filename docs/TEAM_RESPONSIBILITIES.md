# StudySpot Team Responsibilities

## Project Overview

**StudySpot** is a MERN-stack college project for finding campus study spaces and sharing community-reported availability. Students can browse study areas, inspect facilities and recent reports, and submit an update while signed in. Moderators can create, edit, and deactivate space listings.

Availability is community-reported, not live occupancy data. StudySpot does not reserve seats or use occupancy sensors.

| Project detail | Value |
|---|---|
| Project name | StudySpot |
| Project type | MERN stack web application |
| Repository | `SHAESTHA-KOWNANIN/studyspot` |
| Team size | 5 members |
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |

### Evidence and attribution note

This document maps the requested five responsibility areas to the code that exists in the repository. Source files and tests verify implementation status, but by themselves do not establish which teammate authored each historical change. Individual assignments below describe the team’s intended ownership areas; they should not be treated as Git-authorship claims.

## Project Objectives

1. Provide a searchable directory of campus study spaces and facilities.
2. Show the latest community availability report and an ordered report history.
3. Keep availability status separate from report freshness.
4. Require authentication for report submission and moderator authorization for listing changes.
5. Persist users, spaces, and reports in MongoDB when the client is configured for the live API.
6. Support mock mode for isolated frontend development and automated UI tests.
7. Validate API input and expose consistent JSON response envelopes.

## Technology Stack

| Layer | Technologies and role |
|---|---|
| Frontend | React and Vite render pages; React Router defines routes; Lucide React supplies icons; CSS provides responsive styling. |
| API client | Axios sets the API base URL, attaches bearer tokens, normalizes responses, and derives user-facing API errors. |
| Backend | Node.js and Express serve authentication, space, and report routes. |
| Persistence | MongoDB and Mongoose store users, study spaces, reports, and moderator invitations. |
| Authentication | bcryptjs hashes passwords; jsonwebtoken signs and verifies one-day JWTs; middleware reloads the user from MongoDB for authorization. |
| Tests | Vitest, jsdom, and React Testing Library cover the client; Node’s test runner, Supertest, and mongodb-memory-server cover the server. |

## Team Structure

| Member | Role | Primary ownership |
|---|---|---|
| Member 1 | Database and Backend Setup Lead | Database connectivity, server initialization, configuration conventions, and model coordination. |
| Member 2 | Authentication Developer | Registration, login, password security, JWTs, invitations, and role authorization. |
| Member 3 | Study Space API Developer | StudySpace schema, directory/search APIs, validation, and moderator space CRUD. |
| Member 4 | Reports, Freshness and Moderation Developer | Report persistence, status/history APIs, freshness calculation, and report-related validation. |
| Member 5 | Frontend Integration and Testing Lead | React-to-API integration, role-aware UI, browser-facing workflows, frontend tests/build, and project-level QA documentation. |

## Detailed Responsibility of Each Member

### Member 1 — Database and Backend Setup Lead

**Responsibilities**

- Maintain the Express application and server entry point.
- Configure MongoDB connectivity through the existing Mongoose connection helper.
- Coordinate model registration, database field conventions, indexes, and relationships.
- Keep environment configuration separated from source code and avoid exposing credentials.
- Support repeatable development data setup without resetting unrelated records.

**Verified implementation**

- [`server/server.js`](../server/server.js) loads server configuration, connects to MongoDB, and starts the HTTP listener.
- [`server/app.js`](../server/app.js) configures CORS and JSON parsing, registers routes and the StudySpace model, and defines health, 404, and error handlers.
- [`server/src/config/db.js`](../server/src/config/db.js) connects Mongoose using `MONGO_URI`.
- Mongoose schemas are in [`server/src/models/`](../server/src/models/).
- [`server/scripts/seed.js`](../server/scripts/seed.js) and the `seed` npm script upsert five sample spaces and associated reports; it also ensures a sample reporter exists. It is not a general database reset.
- The server’s private configuration loading paths and fallback are documented in [`server/README.md`](../server/README.md). No secret values belong in this document.

**Limitations to communicate**

- The application has a health endpoint, but it does not prove that every external Atlas deployment or credential configuration is valid.
- A production deployment must provide its own protected environment configuration.
- The code and repository layout cannot verify who personally performed the Atlas setup.

### Member 2 — Authentication Developer

**Responsibilities**

- Implement member registration and shared member/moderator login.
- Enforce server-side input validation and bcrypt password hashing.
- Issue and verify JWTs and return safe public user data.
- Protect authenticated routes and apply server-side role checks.
- Implement moderator invitations without permitting role self-assignment.
- Test unauthorized, invalid-token, invitation, and role-escalation cases.

**Verified implementation**

- [`server/src/models/User.js`](../server/src/models/User.js) defines `name`, unique email, hidden `passwordHash`, and the `member`/`moderator` roles. New users default to `member`.
- [`server/src/controllers/authController.js`](../server/src/controllers/authController.js) validates registration and login requests and serializes public user fields.
- [`server/src/services/authService.js`](../server/src/services/authService.js) hashes passwords with bcryptjs, compares credentials, issues JWTs with a one-day expiry, and accepts an invitation token for moderator registration.
- [`server/src/middleware/authMiddleware.js`](../server/src/middleware/authMiddleware.js) verifies bearer tokens, reloads the current MongoDB user, and checks current database roles.
- [`server/src/models/ModeratorInvitation.js`](../server/src/models/ModeratorInvitation.js) and [`server/src/services/moderatorInvitationService.js`](../server/src/services/moderatorInvitationService.js) store invitation token hashes, apply a 24-hour expiry, and prevent reuse.
- [`server/tests/auth.test.js`](../server/tests/auth.test.js) covers registration, login, password hashing, token errors, invitation lifecycle, and member denial for invitation creation.

**Limitations to communicate**

- Public registration does not accept a moderator role. Invitation registration is the supported moderator assignment path.
- Invitation creation requires an existing moderator. The reviewed API does not provide a first-moderator bootstrap endpoint.
- Invitations are bearer links, are not bound to a target email, and have no email-delivery UI in the moderator dashboard.

### Member 3 — Study Space API Developer

**Responsibilities**

- Define the StudySpace model and its database indexes.
- Implement public listing, search, filters, and individual-space retrieval.
- Validate MongoDB IDs, field types, required values, and filter values.
- Restrict create, update, and deactivate operations to moderators.
- Preserve report history when a listing is deactivated.
- Verify API response shapes match the frontend adapter.

**Verified implementation**

- [`server/src/models/StudySpace.js`](../server/src/models/StudySpace.js) defines name, building, area, description, facilities, quiet/group-study flags, active state, timestamps, and indexes.
- [`server/src/controllers/spaceController.js`](../server/src/controllers/spaceController.js) implements serialization, validation, listing/filtering, retrieval, creation, updates, and soft deactivation.
- [`server/src/routes/spaceRoutes.js`](../server/src/routes/spaceRoutes.js) wires the space endpoints and applies moderator authorization to write operations and inactive listings.
- [`server/tests/spaces.test.js`](../server/tests/spaces.test.js) verifies filtering, ID validation, CRUD validation, role enforcement, and deactivation behavior.

**Limitations to communicate**

- DELETE is a soft-delete operation: it sets `active` to false and retains the document.
- Inactive listings are excluded from public listing and detail routes.
- The moderator dashboard offers space management, not report approval/rejection.

### Member 4 — Reports, Freshness and Moderation Developer

**Responsibilities**

- Model availability reports and reference the space and reporter.
- Implement authenticated report submission and safe public history/latest reads.
- Validate report statuses, optional notes, IDs, pagination, and active-space eligibility.
- Compute freshness from the configured threshold without changing the report’s availability status.
- Test persistence, ordering, freshness boundaries, and safe reporter serialization.

**Verified implementation**

- [`server/src/models/SpaceReport.js`](../server/src/models/SpaceReport.js) references `StudySpace` and `User`, validates status values, and stores the report timestamp.
- [`server/src/utils/reportConstants.js`](../server/src/utils/reportConstants.js) defines `Available`, `Moderately Busy`, `Busy`, and `Temporarily Closed`.
- [`server/src/controllers/reportController.js`](../server/src/controllers/reportController.js) validates and creates reports, returns history, and serializes freshness and reporter display data.
- [`server/src/services/statusService.js`](../server/src/services/statusService.js) selects the newest report and calculates `Fresh`, `Stale`, or `No Report` using `STATUS_STALE_AFTER_MINUTES` (default 60).
- [`server/src/routes/reportRoutes.js`](../server/src/routes/reportRoutes.js) exposes report routes under `/api/spaces`; submission requires authentication while latest/history reads are public.
- [`server/tests/reports.test.js`](../server/tests/reports.test.js) covers status validation, persisted history, ordering, timestamps, freshness, and reporter-data safety.

**Implemented versus planned**

- Report history and timestamps are implemented.
- Freshness is a derived response value, not a stored report field; stale freshness does not rewrite availability.
- No separate space moderation log or report approval/rejection/resolution workflow was found in the repository. These must be listed as future work if required by the course specification, not as completed functionality.

### Member 5 — Frontend Integration and Testing Lead (My Role)

**Responsibilities and implementation details**

1. **React-to-Express integration:** Coordinate page-level data loading through adapters under [`client/src/api/`](../client/src/api/).
2. **Axios configuration:** [`client/src/api/axios.js`](../client/src/api/axios.js) defines the API base URL, adds the stored bearer token, normalizes response envelopes, and attaches friendly server error messages.
3. **Authentication pages:** [`client/src/pages/RegisterPage.jsx`](../client/src/pages/RegisterPage.jsx) and [`client/src/pages/LoginPage.jsx`](../client/src/pages/LoginPage.jsx) use shared authentication state and API methods.
4. **Token and session handling:** [`client/src/api/authApi.js`](../client/src/api/authApi.js) stores the live API token and public user in session storage; [`client/src/context/AuthContext.jsx`](../client/src/context/AuthContext.jsx) restores a user and exposes login/register/logout and `isModerator`.
5. **Role-based UI:** [`client/src/components/ProtectedRoute.jsx`](../client/src/components/ProtectedRoute.jsx) and [`client/src/components/ModeratorRoute.jsx`](../client/src/components/ModeratorRoute.jsx) guard frontend routes. [`client/src/components/Navbar.jsx`](../client/src/components/Navbar.jsx) conditionally shows moderator navigation. Backend authorization remains the security boundary.
6. **Directory integration:** [`client/src/pages/SpacesPage.jsx`](../client/src/pages/SpacesPage.jsx), [`client/src/components/SearchFilters.jsx`](../client/src/components/SearchFilters.jsx), and [`client/src/api/spacesApi.js`](../client/src/api/spacesApi.js) connect search, building, area, status, facility, quiet-zone, and group-study filters to the list API.
7. **Space detail integration:** [`client/src/pages/SpaceDetailsPage.jsx`](../client/src/pages/SpaceDetailsPage.jsx) loads a space and its reports from the backend adapters.
8. **Availability reports:** [`client/src/components/ReportForm.jsx`](../client/src/components/ReportForm.jsx) presents the four supported statuses and optional note; [`client/src/api/reportsApi.js`](../client/src/api/reportsApi.js) submits reports and loads report history.
9. **Timestamp and freshness display:** [`client/src/components/StatusBadge.jsx`](../client/src/components/StatusBadge.jsx), [`client/src/components/FreshnessBadge.jsx`](../client/src/components/FreshnessBadge.jsx), [`client/src/components/ReportHistory.jsx`](../client/src/components/ReportHistory.jsx), and [`client/src/utils/statusUtils.js`](../client/src/utils/statusUtils.js) display availability, timestamps, report order, and freshness.
10. **Moderator dashboard integration:** [`client/src/pages/ModeratorDashboard.jsx`](../client/src/pages/ModeratorDashboard.jsx) connects create, edit, and deactivate operations to the spaces API and displays report summaries. Report review/approval controls are not implemented.
11. **Error and state handling:** Pages and forms display validation errors, loading/empty states, and friendly API messages using `error.userMessage` before the generic fallback.
12. **Frontend testing:** Vitest and React Testing Library tests are under [`client/src/test/`](../client/src/test/). Tests cover status utilities, forms, route protection, mock services, report UI, and moderator dashboard interactions.
13. **Integration defect resolution:** In live QA, editing a space initially sent server-managed fields such as `id`, which the backend rejected. The dashboard now sends only editable fields; [`client/src/test/moderator-space-edit.test.jsx`](../client/src/test/moderator-space-edit.test.jsx) verifies that payload.
14. **Build and QA:** `npm test` and `npm run build` are the client validation commands. The project-level live QA results and limitations are recorded in [`docs/QA-REPORT-2026-11-03.md`](./QA-REPORT-2026-11-03.md).
15. **Execution/testing documentation:** [`README.md`](../README.md), [`docs/TESTING.md`](./TESTING.md), and [`docs/API.md`](./API.md) document setup, API contracts, and test coverage. Documentation should be kept aligned with current implementation and recent live QA.
16. **Real backend versus mock mode:** Client adapters use the Express API when `VITE_USE_MOCK_API=false`; otherwise they use local mock services under [`client/src/services/`](../client/src/services/). The API base URL is configured with `VITE_API_BASE_URL`. Vite-prefixed variables are public client configuration and must not contain secrets.
17. **Demonstration preparation:** Validate the application using a known test environment, identify which mode is running, and distinguish backend-persisted records from mock/local-storage records before presenting the workflow.

The frontend supports the listed workflows, but support for a feature in the UI is not proof of a live request by itself. Live API mode, valid backend configuration, and database connectivity are required for frontend operations to use MongoDB-backed data.

## Individual Tasks and Implementation Details

| Member | Main tasks | Key implementation areas | Current status |
|---|---|---|---|
| 1 | Server startup, database connection, model coordination, safe configuration, sample-data tooling | `server/server.js`, `server/app.js`, `server/src/config/db.js`, `server/src/models/`, `server/scripts/seed.js` | **Implemented in repository.** Live database availability depends on deployment configuration. |
| 2 | Registration, login, password hashing, JWTs, current-user lookup, invitations, role middleware | `server/src/controllers/authController.js`, `server/src/services/authService.js`, `server/src/middleware/authMiddleware.js`, `server/src/models/User.js`, `server/src/models/ModeratorInvitation.js` | **Implemented in repository.** First-moderator bootstrap and email-bound invitation delivery are not implemented. |
| 3 | Study-space schema, list/detail endpoints, search/filter, validation, moderator CRUD | `server/src/models/StudySpace.js`, `server/src/controllers/spaceController.js`, `server/src/routes/spaceRoutes.js` | **Implemented in repository.** Deactivation preserves the record and history. |
| 4 | Report schema, submission, history/latest APIs, timestamps, freshness | `server/src/models/SpaceReport.js`, `server/src/controllers/reportController.js`, `server/src/services/statusService.js`, `server/src/routes/reportRoutes.js` | **Implemented in repository.** Moderation logs and approval/rejection workflow are not implemented. |
| 5 | Frontend API integration, authentication state, directory/details/report screens, moderator interface, error handling, tests, builds, QA | `client/src/api/`, `client/src/context/`, `client/src/pages/`, `client/src/components/`, `client/src/test/`, `docs/` | **Implemented in repository and exercised in live QA.** Mock mode remains available and is the default unless configured otherwise. |

## Important Files and Modules Handled by Each Member

### Member 1 — setup and persistence

- [`server/server.js`](../server/server.js)
- [`server/app.js`](../server/app.js)
- [`server/src/config/db.js`](../server/src/config/db.js)
- [`server/src/models/`](../server/src/models/)
- [`server/scripts/seed.js`](../server/scripts/seed.js)
- [`server/tests/seed.test.js`](../server/tests/seed.test.js)

### Member 2 — authentication and permissions

- [`server/src/models/User.js`](../server/src/models/User.js)
- [`server/src/models/ModeratorInvitation.js`](../server/src/models/ModeratorInvitation.js)
- [`server/src/controllers/authController.js`](../server/src/controllers/authController.js)
- [`server/src/services/authService.js`](../server/src/services/authService.js)
- [`server/src/services/moderatorInvitationService.js`](../server/src/services/moderatorInvitationService.js)
- [`server/src/middleware/authMiddleware.js`](../server/src/middleware/authMiddleware.js)
- [`server/src/routes/authRoutes.js`](../server/src/routes/authRoutes.js)
- [`server/tests/auth.test.js`](../server/tests/auth.test.js)

### Member 3 — study spaces

- [`server/src/models/StudySpace.js`](../server/src/models/StudySpace.js)
- [`server/src/controllers/spaceController.js`](../server/src/controllers/spaceController.js)
- [`server/src/routes/spaceRoutes.js`](../server/src/routes/spaceRoutes.js)
- [`server/tests/spaces.test.js`](../server/tests/spaces.test.js)

### Member 4 — reports and freshness

- [`server/src/models/SpaceReport.js`](../server/src/models/SpaceReport.js)
- [`server/src/utils/reportConstants.js`](../server/src/utils/reportConstants.js)
- [`server/src/controllers/reportController.js`](../server/src/controllers/reportController.js)
- [`server/src/services/statusService.js`](../server/src/services/statusService.js)
- [`server/src/routes/reportRoutes.js`](../server/src/routes/reportRoutes.js)
- [`server/tests/reports.test.js`](../server/tests/reports.test.js)

### Member 5 — frontend integration and quality

- [`client/src/api/axios.js`](../client/src/api/axios.js), [`client/src/api/authApi.js`](../client/src/api/authApi.js), [`client/src/api/spacesApi.js`](../client/src/api/spacesApi.js), [`client/src/api/reportsApi.js`](../client/src/api/reportsApi.js)
- [`client/src/context/AuthContext.jsx`](../client/src/context/AuthContext.jsx)
- [`client/src/pages/SpacesPage.jsx`](../client/src/pages/SpacesPage.jsx), [`client/src/pages/SpaceDetailsPage.jsx`](../client/src/pages/SpaceDetailsPage.jsx), [`client/src/pages/ModeratorDashboard.jsx`](../client/src/pages/ModeratorDashboard.jsx)
- [`client/src/components/`](../client/src/components/)
- [`client/src/test/`](../client/src/test/)
- [`README.md`](../README.md), [`docs/API.md`](./API.md), [`docs/TESTING.md`](./TESTING.md), [`docs/QA-REPORT-2026-11-03.md`](./QA-REPORT-2026-11-03.md)

## API Responsibilities

The backend mounts authentication under `/api/auth` and study-space/report routes under `/api/spaces`. Successful responses use a `success` and `data` envelope; errors use `success: false` and a message. See [`docs/API.md`](./API.md) for request/response examples.

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a member, or a moderator when a valid invitation token is supplied | Public |
| `POST` | `/api/auth/login` | Authenticate a member or moderator | Public |
| `GET` | `/api/auth/me` | Return the current authenticated user | Authenticated |
| `POST` | `/api/auth/moderator-invitations` | Create a moderator invitation link | Moderator |
| `GET` | `/api/spaces` | List/search/filter active spaces | Public |
| `GET` | `/api/spaces?includeInactive=true` | Include inactive spaces | Moderator |
| `GET` | `/api/spaces/:id` | Retrieve an active space | Public |
| `POST` | `/api/spaces` | Create a space | Moderator |
| `PATCH` | `/api/spaces/:id` | Update a space | Moderator |
| `DELETE` | `/api/spaces/:id` | Deactivate a space (soft delete) | Moderator |
| `POST` | `/api/spaces/:id/reports` | Submit a report with a supported status | Authenticated member or moderator |
| `GET` | `/api/spaces/:id/reports` | Read paginated report history | Public |
| `GET` | `/api/spaces/:id/reports/latest` | Read latest report, status, and freshness | Public |

The study-space directory supports `search`, `building`, `area`, `facility`, `quietZone`, `groupStudyAllowed`, and `status` filters. Backend validation and server-side authorization are authoritative; hiding frontend controls is not sufficient access control.

## Team Coordination and Dependencies

```text
Member 1: Express startup + MongoDB connectivity + shared model conventions
                         |
              +----------+----------+
              |                     |
Member 2: User/auth/roles     Member 3: StudySpace API
              |                     |
              +----------+----------+
                         |
              Member 4: SpaceReport API
                         |
              Member 5: React/API integration,
              workflow QA, frontend tests/build/docs
```

1. Agree on model fields, identifiers, timestamps, status strings, and response envelopes before wiring the frontend.
2. Member 1 provides a running server and shared database/model conventions.
3. Member 2 provides authenticated identity and the `req.user` role contract used by protected routes.
4. Member 3 provides stable space endpoints and active/inactive semantics.
5. Member 4 uses the registered `StudySpace` and `User` models for report references, and exposes history/latest response fields.
6. Member 5 integrates those contracts through API adapters and reports mismatches with reproducible tests.
7. Coordinate changes to shared response fields before changing either server serialization or frontend expectations.
8. Use isolated test databases for automated backend tests; do not point test suites at live or production data.

## Individual Deliverables

| Member | Deliverables |
|---|---|
| 1 | Runnable server entry point; MongoDB connection helper; safe configuration conventions; coordinated Mongoose model setup; idempotent development seed utility and test. |
| 2 | User schema; registration/login controller and service; hashed-password storage; JWT issuance/verification; role middleware; invitation lifecycle and auth tests. |
| 3 | StudySpace schema and indexes; list/detail endpoints; search and filters; validated moderator create/update/deactivate endpoints; spaces API tests. |
| 4 | SpaceReport schema and reference relationships; authenticated report submission; timestamped history/latest endpoints; freshness service; report API tests. |
| 5 | React pages and reusable UI; Axios/API adapters; token/session and role-aware state; directory/details/report/dashboard integration; user-friendly errors; frontend tests/builds; setup, API, testing, and QA documentation. |

Deliverables describe expected role outputs. Repository presence confirms code exists, not individual historical authorship.

## Testing Responsibilities

### Member 1

- Verify server startup and MongoDB connection in an approved development environment.
- Confirm models register once and references resolve.
- Check that the seed utility is idempotent and uses the configured database only when deliberately invoked.
- Never print credentials or run destructive setup against a shared/production database.

### Member 2

- Test valid/invalid registration and login, duplicate accounts, password hashing, and safe response fields.
- Verify missing, invalid, expired, and deleted-user token handling.
- Verify members are denied moderator routes and invitation creation.
- Verify invitations expire, cannot be reused, and do not allow role assignment without a valid token.

### Member 3

- Test required/unknown fields, malformed IDs, listing/detail not-found behavior, and combined filters.
- Verify moderator-only creation, update, and deactivation.
- Verify public users cannot see inactive listings and report history is retained after deactivation.

### Member 4

- Test all four status values and reject unsupported values.
- Verify reporter identity is taken from the authenticated user, not request-supplied identity.
- Verify timestamp persistence, newest-first ordering, pagination, latest selection, and freshness boundary behavior.
- Confirm stale status does not rewrite availability.

### Member 5

- Run client tests with mock mode explicitly selected; run the production build.
- Verify live API mode uses the Express URL and real response envelopes.
- Test sign-in/session restoration, role-gated navigation, filters, details, reporting form feedback, history, and moderator CRUD.
- Verify API errors surface friendly server messages.
- Keep mock and live API behavior distinct; do not mask backend failures by silently switching to mock data.
- Record environment and database limitations honestly in the QA report.

### Verified current test coverage

- Client tests: [`client/src/test/`](../client/src/test/) covers status utilities, mock services, forms/routes, report UI, dashboard interactions, and the space-edit request payload.
- Server tests: [`server/tests/`](../server/tests/) covers authentication, invitations, space APIs, reports, seed behavior, and validation using mongodb-memory-server and Supertest.
- Available commands: `npm test` and `npm run build` from `client/`; `npm test` from `server/`.
- The end-to-end live QA record is [`docs/QA-REPORT-2026-11-03.md`](./QA-REPORT-2026-11-03.md). Automated tests use isolated in-memory MongoDB, not Atlas.

## Completion Criteria for Each Member

| Member | Completion criteria |
|---|---|
| 1 | Server starts using external configuration; MongoDB connection failures are surfaced; model registration and development seed behavior are documented and testable; no credentials are committed or printed. |
| 2 | Valid users register/login; passwords are hashed; tokens expire and invalid tokens are rejected; role checks use current server-side identity; self-assigned moderator roles are rejected; auth tests pass. |
| 3 | Public listing/search/detail and supported filters return validated response shapes; write operations require a moderator; deactivation hides a space without deleting it or its reports; API tests pass. |
| 4 | Reports persist with authenticated reporter and timestamp; only supported statuses are accepted; history is ordered and latest status is correct; freshness is computed consistently and tested; report API tests pass. |
| 5 | Frontend uses the correct adapter mode and endpoint contracts; member and moderator views work against the backend; error/loading/empty states are clear; client tests and build pass; live QA status and limitations are documented. |

For all members, completion also requires a review of shared-contract changes and no unapproved modification to another member’s or production data.

## Final Project Workflow

1. Start the server after configuring its private database and authentication settings through the project’s documented environment mechanism.
2. Start the Vite client with the correct API URL and explicitly choose mock or live mode.
3. The server connects to MongoDB and registers the application routes/models.
4. A member registers or logs in; the server hashes/compares credentials and issues a JWT.
5. The frontend stores the returned token for the current browser session and uses it for authenticated requests.
6. Public pages request spaces and report data through their API adapters.
7. Signed-in members submit reports; the backend derives their identity and report timestamp and stores a separate report record.
8. The latest report determines availability, while freshness is calculated separately from its timestamp.
9. Moderators manage listings through server-protected create/update/deactivate APIs.
10. Automated tests run against isolated test databases; live QA runs use clearly identified test records and avoid altering demo/production content.
11. Before demonstration, confirm the frontend is in the intended API mode, verify the backend is reachable, and distinguish mock data from MongoDB-persisted data.

## My Individual Contribution as Member 5

As the Frontend Integration and Testing Lead, my contribution is to connect the React experience to the backend’s actual API contracts and verify the resulting workflows rather than rely only on static UI or mock data. The verified work area includes:

- Authentication adapters, token attachment, user-session restoration, and role-aware frontend navigation.
- Directory, filter, detail, report, and moderator-dashboard API integration.
- Display of report timestamps, latest status, report history, and freshness.
- Friendly handling of backend errors and the frontend’s loading, validation, and empty states.
- Frontend automated tests and production build checks.
- Live integration QA documented in [`docs/QA-REPORT-2026-11-03.md`](./QA-REPORT-2026-11-03.md).
- A verified moderator edit defect fix: remove server-managed fields from the dashboard update payload and cover the writable-field contract in [`client/src/test/moderator-space-edit.test.jsx`](../client/src/test/moderator-space-edit.test.jsx).
- Maintaining execution, API, testing, and demonstration documentation in [`README.md`](../README.md), [`docs/API.md`](./API.md), and [`docs/TESTING.md`](./TESTING.md).

**Completion standard for my role:** a user-visible workflow must use the correct adapter and match the backend contract in live mode; relevant automated tests and production build must pass; and any unverified or incomplete integration must be marked as such in the QA record.

## Completed Work and Planned Work

| Feature | Repository status |
|---|---|
| MongoDB-backed users, study spaces, and reports | **Implemented** |
| Registration, login, bcrypt hashing, JWT authentication | **Implemented** |
| Moderator role authorization and invitation registration | **Implemented** |
| Public directory, details, search, and combined filters | **Implemented** |
| Moderator create, edit, and soft-deactivate for spaces | **Implemented and exercised in live QA** |
| Four availability status values, report history, latest status, timestamps, freshness | **Implemented and exercised in live QA** |
| Mock mode and live Express API mode | **Implemented; mode must be configured intentionally** |
| Report moderation approval/rejection/resolution | **Not implemented** |
| Separate moderation/audit log | **Not implemented** |
| Invitation email delivery, email-bound invitation, invitation dashboard | **Not implemented** |
| API endpoint to bootstrap the first moderator | **Not implemented** |
| Automated browser E2E suite | **Planned/not present as a dedicated browser-runner suite**; live QA results are documented separately. |

