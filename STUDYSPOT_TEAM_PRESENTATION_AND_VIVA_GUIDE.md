# STUDYSPOT
## Study Space Availability Reporting System
### Complete Project Walkthrough, File Exploration & Viva / Technical Defence Guide

| Purpose | A team-wide technical preparation and viva defence guide for StudySpot. Each member must understand their own implementation deeply and also master the complete end-to-end system: its data model, REST APIs, JWT security boundaries, multi-filter search aggregation, dynamic freshness calculation, testing suites, live QA evidence, deployment configuration, and honest limitations. |
|---|---|
| **Team Member** | **Assigned Responsibility** |
| **Varsha Chukka** *(Member 1)* | Database setup, MongoDB connection, server bootstrapping, Express app configuration, model coordination, and idempotent seed utility. |
| **Syed Abdul Mateen (Maaz)** *(Member 2)* | Authentication, user registration, login, bcrypt password security (12 rounds), JWT issuance/verification, moderator invitation tokens, transactions, and role middleware. |
| **Kranthi Chint** *(Member 3)* | Study space domain, StudySpace schema & compound indexes, directory search & multi-parameter filtering, aggregation pipeline, moderator space CRUD, and soft deactivation. |
| **Arun Bhuddewar** *(Member 4)* | Space availability reports, SpaceReport schema, authenticated report submission, chronological history pagination, statusService freshness threshold calculation, and safe reporter population. |
| **Shaettha Kownain** *(Member 5)* | Complete frontend SPA implementation, React Router, Axios API adapters, AuthContext, route guards, UI/UX components, payload sanitization defect resolution, Vitest suite, and live QA documentation. |

**Source reviewed:** Complete StudySpot project workspace (`client/` and `server/` trees, Git history, documentation, tests, and live QA records).  
**Version & architecture note:** The repository contains a fully implemented React 18 / Vite 6 Single Page Application, an Express/Node.js REST backend, MongoDB with Mongoose ODM, 41 automated backend tests, 17 automated frontend tests, and documented live QA audits.

---

### How to Use This Document

1. **Foundational Study (Sections 1–3):** All five members must read Sections 1 through 3 to understand the problem domain, full-stack architecture, request lifecycle, and normalized database models.
2. **Individual Deep Dive (Sections 4–8):** Each member must thoroughly master their assigned section. Open every listed file in VS Code. Do not merely memorize filenames—trace actual code execution from the browser UI down to MongoDB queries and back.
3. **Cross-Examination & Live Demo (Sections 9–18):** All members must study the live demonstration script, the 40 whole-project viva questions, the deployment configuration, and the troubleshooting guide. External viva examiners frequently cross-examine students on other team members' modules to test overall architectural comprehension.
4. **Hands-On Verification:** Before presenting, run the test suites (`npm --prefix server test` and `npm --prefix client test`), run the frontend build (`npm --prefix client run build`), inspect MongoDB documents, and verify live API endpoints. Never claim a feature works if you have not personally verified it.

---

### Evidence and Accuracy Rules

- **Code-First Truth:** The actual repository codebase is the sole evidence base. Never claim features that do not exist in the code.
- **Community-Reported Availability:** Availability updates are submitted by campus students. StudySpot does **NOT** use hardware IoT sensors, seat cameras, or automated desk counters.
- **No Seat Reservations:** StudySpot is an availability reporting board, not a seat booking or desk reservation platform.
- **Reporting Workflow:** Availability reports post directly to historical records upon submission. The current codebase does **NOT** feature a moderator report approval/rejection queue or a separate audit log collection.
- **Moderator Invitations:** Invitations are generated as secure bearer URLs (`?invite=<token>`). Direct SMTP email delivery is not implemented in the current code.
- **Soft Deactivation:** Deactivating a study space sets `active: false`. The document is preserved, and all historical community reports remain permanently linked for audit and analytics.

---

### Suggested Presentation Sequence (12–15 Minutes)

| Order | Speaker | Topic & Implementation Focus | Target Time | Handover Script |
|---|---|---|---|---|
| **1** | **Shaettha Kownain** *(Member 5)* | Problem statement, campus study challenges, project vision, UI tour, live catalog, responsive layout, dual-mode architecture. | 2.5 min | *"Now, Member 1 Varsha will explain how our backend server and MongoDB database foundation were established."* |
| **2** | **Varsha Chukka** *(Member 1)* | Server entry point (`server.js`), Express configuration (`app.js`), MongoDB connection (`db.js`), Mongoose model coordination, idempotent seed script (`seed.js`). | 2.5 min | *"Next, Member 2 Maaz will walk us through user security, authentication, password hashing, and role authorization."* |
| **3** | **Syed Abdul Mateen** *(Member 2)* | User registration, login, bcrypt password security (12 rounds), JWT issuance/lifecycle, auth middleware, and secure moderator invitation tokens. | 3.0 min | *"Now, Member 3 Kranthi will explain our Study Space domain, schema design, multi-filter search, and moderator space CRUD."* |
| **4** | **Kranthi Chint** *(Member 3)* | StudySpace schema, compound indexing, multi-parameter catalog search, query aggregation, moderator space CRUD, and soft-deactivation. | 2.5 min | *"Next, Member 4 Arun will explain how availability reporting, chronological history, and freshness calculation operate."* |
| **5** | **Arun Bhuddewar** *(Member 4)* | SpaceReport schema, authenticated report submission, newest-first history pagination, status vs freshness calculation, and stale thresholds. | 2.5 min | *"Finally, Member 5 Shaettha will conclude with our frontend integration, regression testing fixes, and live system demonstration."* |
| **Team** | **All Members** | Live end-to-end workflow demonstration, testing evidence presentation, and answering examiner viva questions. | 2.0 min | Ready for panel cross-examination and technical questions. |

---

## 1. Project Overview — What StudySpot Solves

### 1.1 Problem Statement
On modern college campuses, students frequently struggle to find suitable study locations. Academic facilities are distributed across multiple blocks, reading halls, and departmental centers. Students face several daily obstacles:
1. **Information Fragmentation:** Information regarding quiet zones, group-study permissions, opening hours, and amenities (power outlets, Wi-Fi, printers) is unposted or scattered.
2. **Wasted Transit Time:** Students walk long distances to libraries or reading halls only to find them completely packed, resulting in lost study time and frustration.
3. **Stale Information:** Informal messaging channels (WhatsApp groups, student forums) lack structure, timestamps, and geographic context. Messages such as "Library is full" become obsolete within an hour.

### 1.2 Proposed Solution & Objectives
StudySpot solves this problem by providing a centralized, role-aware web platform where students can discover study areas, view detailed facilities, and inspect community-reported availability.
- **Searchable Space Catalog:** A directory of campus spaces filterable by building, area, amenities, quiet zone rules, and group-study suitability.
- **Crowdsourced Status Reporting:** Authenticated students currently at a space can submit a status update with an optional descriptive note.
- **Dynamic Freshness Engine:** An automated calculation engine that compares report timestamps against a 60-minute freshness threshold, clearly labeling reports as "Fresh" or "Stale".
- **Administrative Governance:** A dedicated Moderator Dashboard empowering campus administrators to manage facility listings without destroying historical community data.

### 1.3 What StudySpot Is — And What It Is NOT

| Feature Dimension | What StudySpot IS | What StudySpot IS NOT |
|---|---|---|
| **Occupancy Tracking** | Student-submitted crowdsourced availability reports. | IoT hardware sensor counters, computer vision feeds, or turnstile integrations. |
| **Space Access** | Information board helping students choose where to walk. | Seat booking, desk reservation, or paid ticketing platform. |
| **Status vs Age** | Independent availability status (`Available`, `Busy`) and time freshness (`Fresh`, `Stale`). | A system that erases status when time elapses; stale reports keep their availability. |
| **User Identity** | Unified user model with role-based access control (`member`, `moderator`). | Self-assigned moderator accounts; moderator registration requires an invitation token. |
| **Data Retention** | Soft-deactivation (`active: false`) preserving all historical community reports. | Hard-deleting space records or cascading report destruction. |

### 1.4 The Four Availability Statuses
1. **Available:** Ample seating is open; power outlets and workstations are accessible.
2. **Moderately Busy:** Seating is partially occupied; individual desks are available, but group tables may be full.
3. **Busy:** Space is near capacity; few or no open seats remain.
4. **Temporarily Closed:** Facility is temporarily inaccessible due to cleaning, campus events, maintenance, or holiday hours.

### 1.5 Freshness vs Availability
A critical architectural concept in StudySpot is that **Freshness is separate from Availability**:
- **Fresh:** The report was submitted within the last 60 minutes (`STATUS_STALE_AFTER_MINUTES`). It reflects recent conditions.
- **Stale:** The report is older than 60 minutes. Conditions may have changed, but the last reported status is still displayed so students know the prior state.
- **No Report:** No community reports have ever been submitted for this space.

### 1.6 One-Minute Project Pitch
> *"StudySpot is a full-stack MERN platform that solves campus study friction. Instead of walking across campus to find overcrowded reading rooms, students use StudySpot to search spaces by facilities and quiet zones, view crowdsourced availability, and verify report freshness. Registered members submit real-time updates with notes, while campus moderators manage listings through a protected dashboard. By separating subjective availability status from objective time freshness and enforcing database-backed security, StudySpot delivers a reliable, crowdsourced campus companion."*

---

## 2. Technical Architecture and Request Lifecycle

### 2.1 Architecture Layers

| Architecture Layer | Technologies | Primary Role in StudySpot | Key Files |
|---|---|---|---|
| **Frontend Presentation** | React 18, Vite 6, React Router DOM 6 | Single Page Application rendering responsive views, client routing, and form validation. | `client/src/main.jsx`, `App.jsx`, `pages/*` |
| **Client State & Context** | React Context API | Centralizes authentication state, session restoration, and role helpers. | `client/src/context/AuthContext.jsx` |
| **HTTP Transport & Adapters** | Axios HTTP Client | Injects Bearer tokens, intercepts 401 unauth errors, and normalizes server error envelopes. | `client/src/api/axios.js`, `client/src/api/*` |
| **Backend API Routing** | Node.js, Express.js | Exposes modular REST endpoints, configures CORS, parses JSON bodies, handles global errors. | `server/server.js`, `app.js`, `src/routes/*` |
| **Security & Middleware** | bcryptjs, jsonwebtoken | Hashes passwords (12 rounds), signs/verifies 1-day JWTs, reloads user from MongoDB for role checks. | `src/services/authService.js`, `src/middleware/authMiddleware.js` |
| **Database & ODM** | MongoDB, Mongoose 8 | Manages schemas, validations, compound indexes, and queries for users, spaces, reports, and invites. | `server/src/config/db.js`, `src/models/*` |

### 2.2 High-Level Architecture Diagram

```text
=========================================================================================
                                STUDYSPOT ARCHITECTURE
=========================================================================================

  +-----------------------------------------------------------------------------------+
  |                                CLIENT TIER (Browser)                             |
  |  React 18 SPA (Vite) <---> AuthContext <---> Pages (Catalog, Details, Dashboard)  |
  |                                      |                                            |
  |                                Axios Adapter                                      |
  |                  (Injects Authorization: Bearer <JWT> token)                     |
  +-----------------------------------------------------------------------------------+
                                         | HTTP JSON REST Requests (Port 5000)
                                         v
  +-----------------------------------------------------------------------------------+
  |                               SERVER TIER (Node/Express)                          |
  |  server.js (Bootstrap) -> app.js (CORS, Express JSON, Global Error Handler)      |
  |                                      |                                            |
  |       +------------------------------+-------------------------------+            |
  |       |                              |                               |            |
  |  /api/auth Router           /api/spaces Router              /api/spaces Router    |
  |  (authRoutes.js)            (spaceRoutes.js)                (reportRoutes.js)     |
  |       |                              |                               |            |
  |  authMiddleware              authMiddleware                  authMiddleware       |
  |  (authenticate)              (authorizeRoles('moderator'))   (authenticate)       |
  |       |                              |                               |            |
  |  authController             spaceController                 reportController      |
  |  authService / invitation   validation / aggregation        statusService         |
  +-----------------------------------------------------------------------------------+
                                         | Mongoose ODM Queries
                                         v
  +-----------------------------------------------------------------------------------+
  |                               PERSISTENCE TIER (MongoDB)                          |
  |  Collections: users | studyspaces | spacereports | moderatorinvitations          |
  +-----------------------------------------------------------------------------------+
```

### 2.3 Detailed API Request Execution Lifecycle

To understand the end-to-end execution, consider a student submitting an availability update for Central Library:
1. **User Action:** The student navigates to `/spaces/:id`, selects "Available", types `"Quiet and lots of open tables"`, and clicks "Share an update".
2. **Client Validation:** `ReportForm.jsx` intercepts submission and executes `validateReport({ status, note })`. It confirms status is valid and note length is <= 300 characters.
3. **API Dispatch:** `ReportForm` triggers `onSubmit()`, calling `createSpaceReport(spaceId, reportData)` in `client/src/api/reportsApi.js`.
4. **Axios Interception:** `client/src/api/axios.js` executes its request interceptor. It reads `sessionStorage.getItem('studyspot-api-token')` and injects `Authorization: Bearer <token>`.
5. **Network Dispatch:** Axios issues `POST /api/spaces/:id/reports` to `http://localhost:5000/api`.
6. **Express Middleware:** Express routes the request to `server/src/routes/reportRoutes.js`.
7. **Authentication Verification:** `authMiddleware.authenticate` extracts the Bearer token, verifies its signature against `JWT_SECRET`, extracts `decoded.sub`, and queries `User.findById(decoded.sub)`. It attaches the fresh user document to `req.user`.
8. **Controller Execution:** `reportController.createReport` verifies that `StudySpace.findOne({ _id: spaceId, active: { $ne: false } })` exists. It validates the status against `REPORT_STATUSES`.
9. **Database Persistence:** It instantiates `new SpaceReport({ spaceId, reporterId: req.user._id, status, note })` and executes `report.save()`.
10. **Population & Freshness:** The controller calls `report.populate({ path: 'reporterId', select: 'name' })` and calculates runtime freshness using `statusService.calculateFreshness()`.
11. **Response Envelope:** Express returns HTTP `201 Created` with `{ success: true, data: { report: {...} } }`.
12. **UI State Update:** `SpaceDetailsPage.jsx` receives the new report, prepends it to its local `reports` array, updates the latest status badge, and renders a success confirmation toast.

---

## 3. Database Design and Relationships

StudySpot models its domain across four normalized collections in MongoDB:

```text
  +-----------------------+              1 : N             +--------------------------+
  |         User          | -----------------------------> |       SpaceReport        |
  +-----------------------+                                +--------------------------+
  | _id (PK)              |                                | _id (PK)                 |
  | name                  |                                | spaceId (FK -> StudySpace)|
  | email (Unique)        |                                | reporterId (FK -> User)  |
  | passwordHash (Hidden) |                                | status (Enum)            |
  | role (Enum)           |                                | note (Optional string)   |
  | createdAt / updatedAt |                                | reportedAt (Date)        |
  +-----------------------+                                +--------------------------+
              |                                                         ^
              | 1 : 1 (Generated by Moderator)                          |
              v                                                         | N : 1
  +-----------------------+                                             |
  |  ModeratorInvitation  |                                             |
  +-----------------------+                                +--------------------------+
  | _id (PK)              |                                |        StudySpace        |
  | tokenHash (Unique)    |                                +--------------------------+
  | expiresAt (TTL Index) |                                | _id (PK)                 |
  | usedAt (Date/Null)    |                                | name                     |
  +-----------------------+                                | building, area           |
                                                           | description              |
                                                           | facilities (Array)       |
                                                           | quietZone, groupStudy    |
                                                           | active (Boolean)         |
                                                           +--------------------------+
```

### 3.1 User Model (`server/src/models/User.js`)
Stores registered members and staff moderators. Schema options: `{ timestamps: true, versionKey: false }`.
- `_id`: Auto-generated MongoDB primary key.
- `name`: String, required, trimmed, 2 to 80 characters.
- `email`: String, required, unique, lowercase, trimmed, validated against email regex.
- `passwordHash`: String, required, `select: false`. Bcrypt hash (12 rounds). Hidden by default from queries.
- `role`: String, required, enum `['member', 'moderator']`, default `'member'`. Public signups default strictly to member.

### 3.2 StudySpace Model (`server/src/models/StudySpace.js`)
Stores campus study facilities. Schema options: `{ timestamps: true, versionKey: false }`.
- `_id`: Auto-generated MongoDB primary key.
- `name`: String, required, trimmed, 1 to 120 characters (e.g., Central Library Reading Hall).
- `building`: String, required, trimmed, 1 to 120 characters (e.g., Main Block).
- `area`: String, required, trimmed, 1 to 120 characters (e.g., Level 2 · East Wing).
- `description`: String, required, trimmed, 1 to 2000 characters.
- `facilities`: Array of Strings (e.g., `["Power outlets", "Wi-Fi", "Printing"]`).
- `quietZone`: Boolean, required, default `false`.
- `groupStudyAllowed`: Boolean, required, default `false`.
- `active`: Boolean, required, default `true`. Soft-deactivation flag.
- **Indexes:** Compound index `{ active: 1, building: 1, area: 1 }` and single index `{ facilities: 1 }`.

### 3.3 SpaceReport Model (`server/src/models/SpaceReport.js`)
Stores crowdsourced availability reports. Schema options: `{ versionKey: false }`.
- `_id`: Auto-generated MongoDB primary key.
- `spaceId`: ObjectId, required, ref `'StudySpace'`. Foreign key linking report to space.
- `reporterId`: ObjectId, required, ref `'User'`. Foreign key linking report to author.
- `status`: String, required, enum `['Available', 'Moderately Busy', 'Busy', 'Temporarily Closed']`.
- `note`: String, trimmed, max 300 characters, non-empty validator.
- `reportedAt`: Date, required, default `Date.now`.
- **Index:** Compound index `{ spaceId: 1, reportedAt: -1 }` optimizing latest-report queries.

### 3.4 ModeratorInvitation Model (`server/src/models/ModeratorInvitation.js`)
Stores secure invitation tokens. Schema options: `{ timestamps: true }`.
- `_id`: Auto-generated MongoDB primary key.
- `tokenHash`: String, required, unique. SHA-256 digest of 32-byte crypto token.
- `expiresAt`: Date, required. Configured with a TTL index (`{ expireAfterSeconds: 0 }`).
- `usedAt`: Date, default `null`. Nullable timestamp indicating consumption.

## 4. Member 1 — Varsha Chukka: Database and Backend Setup Lead

### 4.1 Responsibility Summary
Varsha Chukka is the Database and Backend Setup Lead for StudySpot. Her responsibility is to establish the backend foundation, configure the Express HTTP server, manage MongoDB Atlas connectivity, coordinate Mongoose model schemas and indexes, and provide an idempotent development seeder. Without Member 1's work, the Express server cannot start, route modules cannot mount, and the database cannot persist records.

### 4.2 Files to Explore
| File Path | Primary Responsibility | Important Methods / Logic | What to Explain | Connections |
|---|---|---|---|---|
| `server/server.js` | Server entry point and configuration loader. | `startServer()`, `dotenv.config()`, `app.listen(PORT)` | Two-tier config hierarchy, graceful startup, error exit. | Calls `connectDB()` and boots `app.js`. |
| `server/app.js` | Express application factory and middleware setup. | `app.use(cors())`, `app.use(express.json())`, error handlers | CORS whitelisting, JSON parsing, 404 handler, JSON syntax error interceptor. | Mounts auth, space, and report routers. |
| `server/src/config/db.js` | MongoDB connection bootstrapper. | `connectDB()`, `mongoose.connect()` | Fail-fast error handling, asynchronous connection. | Used by `server.js` and `seed.js`. |
| `server/scripts/seed.js` | Idempotent development seed utility. | `seedData()`, `loadEnvironment()`, deterministic ObjectIds | Upserts 5 campus spaces and initial reports without duplicates. | Populates `StudySpace` and `SpaceReport`. |
| `server/tests/seed.test.js` | Automated test verifying seed idempotence. | `describe("sample data seed")` | Verifies that running seed twice does not create duplicate spaces. | Tests `seed.js`. |

### 4.3 Code Walkthrough — Function by Function

#### A. `server/server.js` — Hierarchical Configuration & Server Startup
```javascript
const os = require("node:os");
const path = require("node:path");
const privateConfigDirectory = process.env.LOCALAPPDATA || path.join(os.homedir(), ".config");
require("dotenv").config({
    path: path.join(privateConfigDirectory, "StudySpot", "server.env")
});
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = require("./app");
const connectDB = require("./src/config/db");
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`StudySpot server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};
startServer();
```
- **Line-by-Line Explanation:**
  - `Lines 1–6`: Configures a secure configuration path in the OS app data directory (`%LOCALAPPDATA%/StudySpot/server.env` on Windows). This guarantees that production credentials are never placed in the Git working directory.
  - `Line 7`: Reads `server/.env` as a local fallback for developers who do not use system-level environment paths.
  - `Lines 14–25`: `startServer` is an asynchronous function. It awaits `connectDB()` **before** calling `app.listen()`. If MongoDB is unreachable, it logs the error and calls `process.exit(1)` (fail-fast design), preventing the server from accepting HTTP traffic when it cannot persist data.

#### B. `server/app.js` — Express Configuration, CORS & Error Handling
```javascript
const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const createReportRoutes = require("./src/routes/reportRoutes");
const createSpaceRoutes = require("./src/routes/spaceRoutes");
const { authenticate } = require("./src/middleware/authMiddleware");
require("./src/models/StudySpace");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/spaces", createSpaceRoutes({ authenticate }));
app.use("/api/spaces", createReportRoutes({ authenticate }));

app.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ success: false, message: "Request body must be valid JSON." });
    }
    return res.status(500).json({ success: false, message: "An unexpected server error occurred." });
});
```
- **Line-by-Line Explanation:**
  - `app.use(cors(...))`: Restricts cross-origin requests to `CLIENT_URL` (default `http://localhost:5173`), preventing unauthorized third-party websites from making cross-origin AJAX calls.
  - `app.use(express.json())`: Parses incoming JSON request bodies into `req.body`.
  - Global error handler intercepts `entity.parse.failed`: If a client sends broken JSON, Express returns a clean HTTP 400 Bad Request envelope rather than crashing or exposing an HTML stack trace.

#### C. `server/src/config/db.js` — MongoDB Connection Bootstrapper
```javascript
const mongoose = require("mongoose");
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};
module.exports = connectDB;
```
- Connects Mongoose using `process.env.MONGO_URI`. Exits process with code 1 on connection failure.

#### D. `server/scripts/seed.js` — Idempotent Development Seeder
```javascript
const SEED_REPORTER_ID = new mongoose.Types.ObjectId("671000000000000000000001");
const STUDY_SPACES = [
    {
        id: "671000000000000000000101",
        reportId: "671000000000000000000201",
        name: "Central Library Reading Hall",
        building: "Main Block",
        area: "Level 2 · East Wing",
        // ...
    }
];
```
- Uses deterministic 24-hex-character ObjectIds for the 5 sample study spaces and their reports.
- Uses upsert logic: running `npm run seed` repeatedly updates the existing records rather than creating duplicate spaces.

### 4.4 Files to Open During Viva
1. `server/server.js` (Show config loading hierarchy and async startup)
2. `server/src/config/db.js` (Show Mongoose connect logic)
3. `server/app.js` (Show CORS, route mounting, and JSON error interceptor)
4. `server/scripts/seed.js` (Show deterministic ObjectIds and idempotent seeding)

### 4.5 Exact Speaking Script
> *"Good morning respected professors and examiners. I am Varsha Chukka, Member 1 and the Database and Backend Setup Lead for StudySpot.*  
>  
> *My responsibility was to establish the server infrastructure, database connectivity, and configuration conventions. I implemented `server/server.js`, which starts our Node HTTP listener on port 5000, and `server/src/config/db.js`, which connects Mongoose to MongoDB Atlas.*  
>  
> *A core design decision I made was ensuring configuration security. To avoid exposing credentials in Git, our server reads settings through a hierarchical loader—first checking the private OS app data directory, then falling back to `server/.env`.*  
>  
> *In `server/app.js`, I configured our Express application pipeline: whitelisting our React Vite client origin with CORS, parsing JSON bodies, and implementing global error handling that catches malformed JSON before it crashes the server.*  
>  
> *I also authored our development database seeder in `server/scripts/seed.js`. By using fixed, deterministic ObjectIds, our seed script is completely idempotent: running it populates our 5 campus spaces and initial reports without ever duplicating records or corrupting active user data.*  
>  
> *With our server and database operating reliably, Member 2 Syed Abdul Mateen built our user security and authentication layer, which he will now present."*

### 4.6 15 Detailed Technical Viva Questions & Model Answers

1. **Why did you choose MongoDB over a relational SQL database like PostgreSQL?**  
   *Answer:* Study spaces have dynamic, evolving attributes—such as variable lists of facilities (Wi-Fi, power outlets, lockers)—that map naturally to document arrays. MongoDB provides schema flexibility, high-performance JSON-like document querying, and horizontal scalability. Mongoose adds schema enforcement and validation on top of MongoDB.
2. **What does 'fail-fast' mean and how is it implemented in `server.js`?**  
   *Answer:* Fail-fast means terminating execution immediately when a critical dependency fails rather than continuing in an unstable state. In `server.js`, `connectDB()` is awaited before `app.listen()`. If MongoDB connection fails, the process exits with `process.exit(1)`, preventing the server from accepting requests it cannot fulfill.
3. **What is CORS and why is it necessary?**  
   *Answer:* Cross-Origin Resource Sharing is a browser security mechanism that blocks web applications running at one origin (`http://localhost:5173`) from making AJAX requests to a different origin (`http://localhost:5000`). We use the `cors` package to whitelist `CLIENT_URL`.
4. **What is the purpose of `express.json()`?**  
   *Answer:* It is built-in Express middleware that parses incoming requests with JSON payloads (based on `Content-Type: application/json`) and populates `req.body` with the parsed JavaScript object.
5. **How does your global error handler catch broken JSON?**  
   *Answer:* In `server/app.js`, when a client sends invalid JSON syntax, the `express.json()` body-parser throws an error with `error.type === 'entity.parse.failed'`. Our 4-argument error handler checks this property and returns HTTP 400 Bad Request.
6. **What does idempotence mean in the context of your seed script?**  
   *Answer:* An operation is idempotent if executing it multiple times produces the exact same result as executing it once. Our seeder uses fixed ObjectIds and upserts documents; running it 10 times results in exactly 5 spaces, not 50.
7. **What is Mongoose and how does it relate to MongoDB?**  
   *Answer:* Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It manages relationships between data, provides schema validation, translates between JavaScript objects and MongoDB BSON documents, and coordinates queries.
8. **Why do you use `process.env.PORT || 5000`?**  
   *Answer:* Cloud hosting platforms (like Render or Heroku) dynamically assign a port via the `PORT` environment variable. Using `process.env.PORT || 5000` allows the server to adapt to cloud environments while defaulting to port 5000 locally.
9. **How do you keep secrets out of Git?**  
   *Answer:* We add `.env` and `server.env` to `.gitignore`. We only commit `.env.example` templates with placeholder values. Furthermore, `server.js` looks in `%LOCALAPPDATA%/StudySpot/server.env` outside the repository directory.
10. **What is the difference between `server.js` and `app.js`?**  
    *Answer:* `app.js` is the Express application factory that configures middleware, routes, and error handlers without starting the HTTP listener. `server.js` is the entry point that connects to the database and binds the app to a network port. This separation allows test suites (Supertest) to import `app.js` without binding to live network sockets.
11. **What is a Mongoose connection string format?**  
    *Answer:* `mongodb://[username:password@]host[:port]/[database][?options]` or `mongodb+srv://` for DNS seedlist connections to MongoDB Atlas clusters.
12. **What happens if a request hits an undefined endpoint?**  
    *Answer:* `server/app.js` registers a catch-all 404 handler after all valid route mounts: `app.use((req, res) => res.status(404).json({ success: false, message: "API endpoint not found" }))`.
13. **Why do you register `require("./src/models/StudySpace")` in `app.js`?**  
    *Answer:* To ensure the `StudySpace` Mongoose model is registered in Mongoose's internal model registry at startup, preventing `MissingSchemaError` when `SpaceReport` populates references.
14. **How do you verify your seed script works?**  
    *Answer:* We wrote an automated test in `server/tests/seed.test.js` that boots an in-memory database, runs `seedData()`, and asserts that exactly 5 spaces exist with valid schemas.
15. **What is the role of `versionKey: false` in schemas?**  
    *Answer:* It disables Mongoose's internal `__v` document revision field, producing clean, standard JSON documents for frontend consumption.

### 4.7 Likely Cross-Questions
- *Cross-Question:* "Why not use Docker instead of a seed script?"  
  *Answer:* Docker manages containerized environments, which is great for production, but a seed script provides a lightweight, cross-platform method for any student or examiner to populate test data with a single command (`npm run seed`) without requiring Docker daemon installation.
- *Cross-Question:* "What happens if two instances of your server run simultaneously?"  
  *Answer:* Because the server is stateless and session state is handled via JWTs, multiple server instances can run behind a load balancer without issue. MongoDB manages document locking for database writes.

### 4.8 What Member 1 Must Prepare
- Open `server/server.js`, `server/app.js`, and `server/src/config/db.js` in VS Code tabs.
- Be ready to run `npm --prefix server test` in the terminal to demonstrate backend test execution.
- Be ready to explain why `app.js` is exported separately from `server.js`.

---

## 5. Member 2 — Syed Abdul Mateen (Maaz): Authentication & Security Developer

### 5.1 Responsibility Summary
Syed Abdul Mateen (Maaz) owns the identity, authentication, and authorization tier. He designed the `User` schema, implemented password hashing with bcryptjs (12 work factor rounds), engineered stateless 1-day JWT issuance and verification, built the authentication and role middleware, and developed a secure, single-use moderator invitation system utilizing cryptographic tokens and MongoDB transactions.

### 5.2 Files to Explore
| File Path | Primary Responsibility | Important Methods / Logic | What to Explain | Connections |
|---|---|---|---|---|
| `server/src/models/User.js` | User schema and field constraints. | `userSchema`, `passwordHash: { select: false }`, `role: enum` | Role enum, email regex, hidden password hash. | Referenced by `authService` and `SpaceReport`. |
| `server/src/models/ModeratorInvitation.js` | Moderator invite token schema. | `tokenHash`, `expiresAt (TTL index)`, `usedAt` | Single-use consumption, automated TTL expiration. | Used by `moderatorInvitationService`. |
| `server/src/controllers/authController.js` | Request validation and response envelopes. | `register()`, `login()`, `getCurrentUser()`, `createModeratorInvite()` | Input sanitization, field validation, public user serialization. | Mounts to `authRoutes.js`. |
| `server/src/services/authService.js` | Password hashing, JWT signing, user creation. | `register()`, `login()`, `createToken()`, `publicUser()` | 12-round bcrypt hashing, 1-day JWT signing, transaction handling. | Interfaces with `User` and `authController`. |
| `server/src/services/moderatorInvitationService.js` | Cryptographic invite generation and atomic consumption. | `createModeratorInvitation()`, `consumeModeratorInvitation()` | `crypto.randomBytes(32)`, SHA-256 hash, MongoDB transactions. | Used by `authService` and `authController`. |
| `server/src/middleware/authMiddleware.js` | Express security middleware. | `authenticate()`, `authorizeRoles()` | Bearer token verification, DB user existence reload, 401/403 guards. | Protects space and report routes. |
| `server/tests/auth.test.js` | Automated authentication test suite (15 tests). | Unit & integration tests | Duplicate registration rejection, token expiry, role escalation denial. | Tests all auth files. |

### 5.3 Code Walkthrough — Function by Function

#### A. `server/src/models/User.js` — User Schema & Hidden Password Hash
```javascript
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
        email: {
            type: String, required: true, unique: true, lowercase: true, trim: true,
            maxlength: 254, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        passwordHash: { type: String, required: true, select: false },
        role: { type: String, enum: ["member", "moderator"], default: "member", required: true }
    },
    { timestamps: true, versionKey: false }
);
```
- `passwordHash: { select: false }`: Ensures password hashes are never returned by default in Mongoose queries, preventing accidental credential leakage in API responses.
- `role`: Restricted by Mongoose `enum` to `"member"` or `"moderator"`, defaulting to `"member"`.

#### B. `server/src/services/authService.js` — Registration & Password Hashing
```javascript
const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "1d";

function createToken(user) {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured.");
    return jwt.sign(
        { sub: user._id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );
}

async function register({ name, email, password, invitationToken }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        const error = new Error("An account with this email already exists.");
        error.status = 409;
        throw error;
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userData = { name: name.trim(), email: normalizedEmail, passwordHash, role: "member" };

    if (invitationToken) {
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                const valid = await consumeModeratorInvitation(invitationToken, session);
                if (!valid) throw new Error("Invalid or expired moderator invitation.");
                userData.role = "moderator";
                const created = await User.create([userData], { session });
                user = created[0];
            });
        } finally { await session.endSession(); }
    } else {
        user = await User.create(userData);
    }
    return { token: createToken(user), user: publicUser(user) };
}
```
- Uses bcrypt with **12 salt rounds**.
- Public registrations strictly default to `role: "member"`.
- If an `invitationToken` is supplied, consumption runs inside an atomic MongoDB transaction. If the invite is valid, `role` is elevated to `"moderator"`.

#### C. `server/src/middleware/authMiddleware.js` — Bearer Token Verification & Role Guard
```javascript
async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Authentication required." });
    }
    const token = authHeader.slice(7);
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
    try {
        const user = await User.findById(decoded.sub);
        if (!user) {
            return res.status(401).json({ success: false, message: "User account no longer exists." });
        }
        req.user = user;
        next();
    } catch (error) { next(error); }
}

function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "You do not have permission to perform this action." });
        }
        next();
    };
}
```
- Re-queries `User.findById(decoded.sub)` on every authenticated request. If a user account was deleted or revoked, requests are rejected even if the cryptographic token signature is technically valid.
- `authorizeRoles("moderator")` rejects student members with HTTP 403 Forbidden.

#### D. `server/src/services/moderatorInvitationService.js` — Single-Use Invites & Transactions
```javascript
const createModeratorInvitation = async () => {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await ModeratorInvitation.create({ tokenHash: hashToken(token), expiresAt });
    return { token, expiresAt };
};

const consumeModeratorInvitation = async (token, session) => {
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token) || !session) return false;
    const invitation = await ModeratorInvitation.findOneAndUpdate(
        { tokenHash: hashToken(token), usedAt: null, expiresAt: { $gt: new Date() } },
        { $set: { usedAt: new Date() } },
        { returnDocument: "after", session }
    );
    return Boolean(invitation);
};
```
- Stores SHA-256 hash of the token (`hashToken`).
- Uses `findOneAndUpdate` with `{ usedAt: null }` inside a transaction to prevent double-spending or race conditions.

### 5.4 Files to Open During Viva
1. `server/src/models/User.js` (Show `select: false` and `role` enum)
2. `server/src/services/authService.js` (Show bcrypt 12 rounds and JWT signing)
3. `server/src/middleware/authMiddleware.js` (Show `authenticate` and `authorizeRoles`)
4. `server/src/services/moderatorInvitationService.js` (Show crypto tokens and atomic consumption)

### 5.5 Exact Speaking Script
> *"Good morning respected examiners. I am Syed Abdul Mateen, Member 2 and the Authentication and Security Developer for StudySpot.*  
>  
> *My responsibility was to engineer our identity architecture, password security, session token issuance, and role authorization.*  
>  
> *In `server/src/models/User.js`, I designed our User schema. We enforce normalized lowercase emails and role enumeration. Notice that `passwordHash` has `select: false` configured—meaning Mongoose automatically strips password hashes from query results, ensuring they are never accidentally leaked in API responses.*  
>  
> *In `server/src/services/authService.js`, I implemented registration and login. Passwords are salted and hashed using bcryptjs with a heavy work factor of 12 rounds, rendering rainbow table and GPU brute-force attacks computationally infeasible. When users authenticate, we issue a stateless JSON Web Token signed with HMAC-SHA256, containing the user ID and role, expiring in 24 hours.*  
>  
> *To protect our endpoints, I engineered `authMiddleware.js`. The `authenticate` function validates the Bearer token, checks expiration, and re-queries MongoDB. This is critical: if a user account is deleted after token issuance, our server rejects them immediately. Our `authorizeRoles` guard restricts administrative space routes strictly to moderators.*  
>  
> *I also solved a difficult security challenge: how to provision moderators without allowing public self-escalation. I built a Moderator Invitation system in `moderatorInvitationService.js`. Existing moderators generate cryptographically random 32-byte tokens. When a new moderator registers, the token is verified and marked used inside an atomic MongoDB transaction, preventing race conditions or token reuse.*  
>  
> *My module is verified by 15 passing automated backend tests. Now, Member 3 Kranthi Chint will present our Study Space APIs."*

### 5.6 15 Detailed Technical Viva Questions & Model Answers

1. **What is the difference between authentication and authorization in StudySpot?**  
   *Answer:* Authentication verifies identity (who the user is, verified by email, password, and JWT). Authorization verifies permissions (what the authenticated user is allowed to do, e.g., checking `req.user.role === 'moderator'`).
2. **Why do you use bcrypt with 12 salt rounds instead of SHA-256?**  
   *Answer:* SHA-256 is designed to be fast, allowing attackers to calculate billions of hashes per second using GPUs. Bcrypt is an adaptive key-derivation function that incorporates an automatic per-password salt and heavy computational cost (12 rounds = $2^{12} = 4096$ iterations), making dictionary attacks impossible.
3. **What is inside your JWT payload?**  
   *Answer:* `{ sub: user._id.toString(), role: user.role, iat: <issued_at>, exp: <expires_at> }`.
4. **Is the JWT payload encrypted?**  
   *Answer:* No. JWT payloads are Base64Url-encoded, not encrypted. Anyone can decode and read the claims. However, the signature guarantees integrity: any modification to the payload invalidates the signature.
5. **How does `authMiddleware.authenticate` handle expired tokens?**  
   *Answer:* `jwt.verify()` throws a `TokenExpiredError`. The catch block catches this and returns HTTP 401 Unauthorized with `{ success: false, message: "Invalid or expired token." }`.
6. **Why does `authenticate` query `User.findById()` on every request?**  
   *Answer:* To verify that the user still exists in MongoDB and ensure fresh role data. If a user is deleted from the database, their active token is immediately rejected.
7. **What is a race condition in invitation consumption and how do you prevent it?**  
   *Answer:* If two users submit the same invitation token simultaneously, both might read `usedAt: null` and both register as moderators. We prevent this by executing `consumeModeratorInvitation` with `findOneAndUpdate({ tokenHash, usedAt: null })` inside an atomic MongoDB transaction. Document-level write locks ensure only one request can set `usedAt`.
8. **Why do you hash invitation tokens with SHA-256?**  
   *Answer:* If the database is compromised, storing plaintext invitation tokens would allow an attacker to read active invites and create moderator accounts. Storing `tokenHash` prevents this.
9. **How does MongoDB automatically delete expired invitation tokens?**  
   *Answer:* In `ModeratorInvitation.js`, we define a TTL index: `moderatorInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })`. A background MongoDB thread deletes documents once `expiresAt` is in the past.
10. **What HTTP status code is returned when a student tries to create a study space?**  
    *Answer:* HTTP 403 Forbidden, because the student is authenticated but lacks the `'moderator'` role.
11. **What HTTP status code is returned when an unauthenticated visitor tries to submit a report?**  
    *Answer:* HTTP 401 Unauthorized, because no valid Bearer token was supplied.
12. **How do you prevent duplicate email registrations?**  
    *Answer:* `User.email` has a unique index in MongoDB. In `authService.js`, we check `User.findOne({ email: normalizedEmail })` and throw an HTTP 409 Conflict error. If concurrent requests race, MongoDB's unique index throws error code `11000`, which our controller catches and returns as HTTP 409.
13. **Why do you normalize emails to lowercase?**  
    *Answer:* Email addresses are case-insensitive by internet standards (`User@College.edu` and `user@college.edu` are the same mailbox). Normalizing prevents duplicate account creation through case variation.
14. **How long do your JWTs remain valid?**  
    *Answer:* 24 hours (`"1d"`).
15. **Can a student assign themselves moderator privileges during public registration?**  
    *Answer:* No. In `authService.register`, `userData.role` is explicitly hardcoded to `'member'`. It can only be elevated to `'moderator'` if a valid, unconsumed invitation token is verified.

### 5.7 Likely Cross-Questions
- *Cross-Question:* "What happens if `process.env.JWT_SECRET` is missing?"  
  *Answer:* Both `createToken()` and `authenticate()` check `process.env.JWT_SECRET`. If it is missing, they throw an error, logging `"JWT_SECRET is not configured"` and returning HTTP 500/503.
- *Cross-Question:* "Why not use refresh tokens?"  
  *Answer:* Refresh tokens are valuable for long-lived mobile sessions. For a college project web portal, 1-day access tokens provide an ideal balance of simplicity, security, and user convenience without requiring token rotation databases.

### 5.8 What Member 2 Must Prepare
- Open `server/src/models/User.js`, `server/src/services/authService.js`, and `server/src/middleware/authMiddleware.js`.
- Be ready to trace how a token is verified and decoded in `authMiddleware.js`.
- Be ready to explain the difference between 401 Unauthorized and 403 Forbidden.

## 6. Member 3 — Kranthi Chint: Study Space API Developer

### 6.1 Responsibility Summary
Kranthi Chint owns the core campus study space domain. He designed the `StudySpace` collection schema and compound database indexes, developed the multi-parameter search engine, wrote the MongoDB aggregation pipeline for availability status filtering, and implemented moderator CRUD endpoints featuring strict payload validation and soft-deactivation. Member 3 ensures that campus spaces are rich in facility metadata, searchable in real-time, and that deactivating a facility never destroys historical report archives.

### 6.2 Files to Explore
| File Path | Primary Responsibility | Important Methods / Logic | What to Explain | Connections |
|---|---|---|---|---|
| `server/src/models/StudySpace.js` | StudySpace schema and compound indexes. | `studySpaceSchema`, compound index `{ active, building, area }` | Facilities array, quietZone, groupStudy, soft-delete flag. | Referenced by `SpaceReport` and `spaceController`. |
| `server/src/routes/spaceRoutes.js` | Express route declarations and role guards. | `createSpaceRoutes({ authenticate })`, `includeInactive` logic | Public vs moderator routes, query param evaluation. | Connects to `spaceController` and `app.js`. |
| `server/src/controllers/spaceController.js` | Space listing, search, filtering, CRUD. | `getSpaces()`, `getSpace()`, `createSpace()`, `updateSpace()`, `deactivateSpace()` | Regex search, status aggregation pipeline, field validation, soft-delete. | Uses `StudySpace` and `SpaceReport`. |
| `server/tests/spaces.test.js` | Automated study space test suite (9 tests). | Unit & integration tests | Multi-filter validation, moderator-only CRUD, soft deactivation. | Verifies space routes and controllers. |

### 6.3 Code Walkthrough — Function by Function

#### A. `server/src/models/StudySpace.js` — Schema & Compound Indexing
```javascript
const studySpaceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
        building: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
        area: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
        description: { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 },
        facilities: { type: [{ type: String, trim: true, minlength: 1, maxlength: 80 }], default: [] },
        quietZone: { type: Boolean, default: false, required: true },
        groupStudyAllowed: { type: Boolean, default: false, required: true },
        active: { type: Boolean, default: true, required: true }
    },
    { timestamps: true, versionKey: false }
);

studySpaceSchema.index({ active: 1, building: 1, area: 1 });
studySpaceSchema.index({ facilities: 1 });
```
- Compound index `{ active: 1, building: 1, area: 1 }`: Optimizes directory lookups because all public queries filter for `active: true` and sort/filter by building and area.
- Multi-key index on `{ facilities: 1 }`: Optimizes queries searching for specific amenities (e.g. Wi-Fi).

#### B. `server/src/controllers/spaceController.js` — Multi-Parameter Filtering & Aggregation
```javascript
async function getSpaces(req, res) {
    const { search, building, area, facility, status, includeInactive } = req.query;
    const filter = {};
    if (includeInactive !== "true") filter.active = true;
    if (building?.trim()) filter.building = building.trim();
    if (area?.trim()) filter.area = area.trim();
    if (facility?.trim()) filter.facilities = facility.trim();

    const searchTerm = search?.trim();
    if (searchTerm) {
        const expression = new RegExp(escapeRegex(searchTerm), "i");
        filter.$or = [
            { name: expression }, { building: expression },
            { area: expression }, { description: expression }
        ];
    }

    if (status) {
        const latestReports = await SpaceReport.aggregate([
            { $sort: { reportedAt: -1, _id: -1 } },
            { $group: { _id: "$spaceId", status: { $first: "$status" } } },
            { $match: { status } },
            { $project: { _id: 1 } }
        ]);
        filter._id = { $in: latestReports.map((report) => report._id) };
    }

    const spaces = await StudySpace.find(filter).sort({ name: 1, _id: 1 }).exec();
    return res.status(200).json({ success: true, data: { spaces: spaces.map(serializeSpace) } });
}
```
- Keyword search uses `escapeRegex()` and `$or` regex across 4 fields.
- Status filtering executes an aggregation pipeline on `SpaceReport`: sorts reports newest first, groups by `spaceId`, matches the desired status, and constrains the study space query to those space IDs.

#### C. `spaceController.js` — Strict Validation & Soft Deactivation
```javascript
const SPACE_FIELDS = ["name", "building", "area", "description", "facilities", "quietZone", "groupStudyAllowed", "active"];

function validateSpaceData(body, { partial = false } = {}) {
    if (!body || typeof body !== "object" || Array.isArray(body)) return "Request body must be a JSON object.";
    const unknownField = Object.keys(body).find((field) => !SPACE_FIELDS.includes(field));
    if (unknownField) return `Unknown study-space field: ${unknownField}.`;
    // Validate types and bounds...
}

async function deactivateSpace(req, res) {
    if (!isValidId(req.params.id)) return sendError(res, 400, "Invalid study space ID.");
    const space = await StudySpace.findById(req.params.id).exec();
    if (!space) return sendError(res, 404, "Study space not found.");
    space.active = false;
    await space.save();
    return res.status(200).json({ success: true, data: { space: serializeSpace(space) } });
}
```
- `validateSpaceData` strictly rejects unknown keys (e.g., client-sent IDs).
- `deactivateSpace` soft-deletes by setting `space.active = false`, hiding it from public students while retaining all associated `SpaceReport` documents.

### 6.4 Files to Open During Viva
1. `server/src/models/StudySpace.js` (Show schema and compound indexes)
2. `server/src/controllers/spaceController.js` (Show `getSpaces` aggregation and `deactivateSpace`)
3. `server/src/routes/spaceRoutes.js` (Show `includeInactive` moderator check)

### 6.5 Exact Speaking Script
> *"Good morning respected professors. I am Kranthi Chint, Member 3 and the Study Space API Developer for StudySpot.*  
>  
> *My responsibility was to model our campus study facilities and engineer the REST APIs that power our catalog, search engine, and moderator space management.*  
>  
> *In `server/src/models/StudySpace.js`, I designed our StudySpace schema. Each listing captures essential academic attributes: building name, floor area, description, quiet zone rules, group study suitability, and an array of amenities like Wi-Fi and power outlets. To guarantee high performance as campus data grows, I created a compound index on active status, building, and area.*  
>  
> *In `server/src/controllers/spaceController.js`, I built our multi-parameter search engine. Students can search with a free-text keyword matching across titles and descriptions using case-insensitive regular expressions, while combining filters for buildings, quiet zones, and facilities. When students filter by live availability status, my controller executes a MongoDB aggregation pipeline over SpaceReport, finding the newest report for every space and matching the requested status.*  
>  
> *For our campus moderators, I implemented create, update, and soft-deactivation endpoints protected by Member 2's authorization middleware. Crucially, when a moderator deletes a space, our server performs a soft delete: it sets `active` to false. The space is hidden from student searches, but every single historical availability report is permanently retained for audit and analytics.*  
>  
> *My module is backed by 9 passing automated tests. Member 4 Arun Bhuddewar will now present our availability reporting and freshness engine."*

### 6.6 15 Detailed Technical Viva Questions & Model Answers

1. **Why did you use soft-delete (`active: false`) instead of `findByIdAndDelete`?**  
   *Answer:* A physical delete would orphan all historical `SpaceReport` documents referencing that space's ID. Soft-deletion preserves referential integrity, allows historical data analysis, and makes reactivation trivial if a facility re-opens.
2. **How does your status filter work across two separate collections (`StudySpace` and `SpaceReport`)?**  
   *Answer:* In `spaceController.js`, we run an aggregation pipeline on `SpaceReport`: it sorts reports descending by timestamp, groups by `$spaceId`, picks `$first: '$status'`, matches the requested status, and returns matching space IDs. The main query then executes `StudySpace.find({ _id: { $in: matchingIds } })`.
3. **What is the purpose of `escapeRegex` in your keyword search?**  
   *Answer:* If a student enters special regex characters (like `*`, `+`, `?`, `(`), evaluating them in `new RegExp()` without escaping could cause regex syntax errors or Regular Expression Denial of Service (ReDoS). `escapeRegex` escapes those characters safely.
4. **What is a compound index and why did you index `{ active: 1, building: 1, area: 1 }`?**  
   *Answer:* A compound index indexes multiple fields in a specific order. Since public queries always filter by `active: true` and frequently filter or sort by `building` and `area`, this index allows MongoDB to satisfy queries directly from the index tree without scanning documents in memory.
5. **How do you validate MongoDB ObjectIds in request parameters?**  
   *Answer:* Using `mongoose.isObjectIdOrHexString(id)`. If invalid, we immediately return HTTP 400 Bad Request with `"Invalid study space ID"`, preventing Mongoose cast errors.
6. **Why do you reject unknown fields in `validateSpaceData`?**  
   *Answer:* Strict schema filtering prevents mass-assignment vulnerabilities where a client might inject arbitrary properties. It also prevents bugs, such as when the frontend mistakenly sends server-managed fields like `id`.
7. **What HTTP status code is returned when a study space is not found?**  
   *Answer:* HTTP 404 Not Found.
8. **Can regular students view inactive study spaces?**  
   *Answer:* No. Public `getSpaces()` enforces `filter.active = true`. Only moderators requesting `?includeInactive=true` can view inactive listings.
9. **How does `updateSpace` perform partial updates?**  
   *Answer:* It validates that at least one valid space field is present, retrieves the existing document via `findById`, applies `Object.assign(space, req.body)`, and calls `space.save()`.
10. **What is the difference between `find()` and `findOne()` in Mongoose?**  
    *Answer:* `find()` returns an array of matching documents (or empty array); `findOne()` returns a single document matching the criteria (or `null`).
11. **Why do you sort spaces by `{ name: 1, _id: 1 }` in `getSpaces`?**  
    *Answer:* To ensure deterministic, alphabetical ordering in the student directory. Including `_id` acts as a tie-breaker if two spaces share the same name.
12. **How does your schema validate facilities?**  
    *Answer:* In `StudySpace.js`, `facilities` is an array of strings, where each element is trimmed and constrained between 1 and 80 characters.
13. **Why is `active` required with default `true`?**  
    *Answer:* To guarantee that every new space document is explicitly active upon creation without requiring the caller to specify it.
14. **How do you handle boolean query parameters like `quietZone=true`?**  
    *Answer:* Query parameters arrive as strings (`"true"` or `"false"`). `validateBooleanFilter()` converts `"true"` to `true`, `"false"` to `false`, and returns an error if any other string is supplied.
15. **What happens if someone sends a description longer than 2000 characters?**  
    *Answer:* `validateSpaceData()` rejects the request with HTTP 400 Bad Request: `"Description must be 2000 characters or fewer."`

### 6.7 Likely Cross-Questions
- *Cross-Question:* "Why not embed reports directly inside the `StudySpace` document as an array?"  
  *Answer:* Embedding reports would cause `StudySpace` documents to grow indefinitely, hitting MongoDB's 16MB document size limit. Separating `SpaceReport` allows unbounded history, fast pagination, and independent indexes.
- *Cross-Question:* "Is regex search fast on large datasets?"  
  *Answer:* Regex searches without a prefix index require scanning indexed text fields. For a campus catalog of dozens or hundreds of study spaces, regex execution takes less than 2 milliseconds. For campus-wide scale with millions of records, MongoDB Atlas Search (Lucene) would be used.

### 6.8 What Member 3 Must Prepare
- Open `server/src/models/StudySpace.js` and `server/src/controllers/spaceController.js`.
- Be ready to trace the aggregation pipeline in `getSpaces`.
- Be ready to explain the compound index `{ active: 1, building: 1, area: 1 }`.

---

## 7. Member 4 — Arun Bhuddewar: Availability Reporting, Freshness & Moderation Developer

### 7.1 Responsibility Summary
Arun Bhuddewar owns the crowdsourced availability reporting and freshness calculation engine. He designed the `SpaceReport` schema, built authenticated report submission with strict privacy protections (preventing reporter ID spoofing and hiding password hashes), implemented chronological report history with safe integer pagination, and created the dynamic freshness calculation service comparing elapsed time against `STATUS_STALE_AFTER_MINUTES`.

### 7.2 Files to Explore
| File Path | Primary Responsibility | Important Methods / Logic | What to Explain | Connections |
|---|---|---|---|---|
| `server/src/models/SpaceReport.js` | Availability report schema and foreign references. | `spaceReportSchema`, compound index `{ spaceId: 1, reportedAt: -1 }` | `spaceId` FK, `reporterId` FK, status enum, note validator. | References `StudySpace` and `User`. |
| `server/src/utils/reportConstants.js` | Single source of truth for status strings. | `REPORT_STATUSES` array | 4 supported status strings. | Used by controllers, services, and models. |
| `server/src/controllers/reportController.js` | Report submission, history pagination, latest status. | `createReport()`, `getReportHistory()`, `getLatestReportStatus()`, `serializeReport()` | Safe population (`reporterId.name`), integer pagination, active space check. | Mounts to `reportRoutes.js`. |
| `server/src/services/statusService.js` | Runtime freshness calculation engine. | `calculateFreshness()`, `getLatestReport()`, `getLatestStatus()` | Mathematical freshness formula, stale threshold, status retention. | Used by `reportController`. |
| `server/tests/reports.test.js` | Automated reporting test suite (16 tests). | Unit & integration tests | Status validation, newest-first order, freshness boundaries, privacy. | Verifies report routes and services. |

### 7.3 Code Walkthrough — Function by Function

#### A. `server/src/models/SpaceReport.js` — Schema & Compound Indexing
```javascript
const spaceReportSchema = new mongoose.Schema({
    spaceId: { type: mongoose.Schema.Types.ObjectId, ref: "StudySpace", required: true },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, required: true, enum: REPORT_STATUSES },
    note: {
        type: String, trim: true, maxlength: 300,
        validate: { validator: (val) => val === undefined || val.length > 0, message: "Note cannot be empty." }
    },
    reportedAt: { type: Date, default: Date.now, required: true }
}, { versionKey: false });

spaceReportSchema.index({ spaceId: 1, reportedAt: -1 });
```
- Foreign references: `spaceId` references `StudySpace`; `reporterId` references `User`.
- Compound index `{ spaceId: 1, reportedAt: -1 }`: Enables instant retrieval of the newest report for any space without sorting the full collection in memory.

#### B. `server/src/controllers/reportController.js` — Submission & Safe Population
```javascript
async function createReport(req, res) {
    const { id: spaceId } = req.params;
    const user = req.user; // Securely derived by authMiddleware
    const { status, note } = req.body ?? {};

    if (!REPORT_STATUSES.includes(status)) return sendError(res, 400, "Choose a valid availability status.");
    const trimmedNote = note?.trim();
    if (trimmedNote && trimmedNote.length > 300) return sendError(res, 400, "Note must be 300 characters or fewer.");

    const StudySpace = getModel("StudySpace");
    const space = await StudySpace.findOne({ _id: spaceId, active: { $ne: false } }).select("_id").exec();
    if (!space) return sendError(res, 404, "Study space not found or inactive.");

    const report = new SpaceReport({
        spaceId,
        reporterId: user._id, // Client cannot spoof reporterId
        status,
        ...(trimmedNote ? { note: trimmedNote } : {})
    });
    await report.save();
    await report.populate({ path: "reporterId", select: "name" }); // Safe population

    return res.status(201).json({ success: true, data: { report: serializeReport(report) } });
}
```
- Security: Reporter ID is taken strictly from `req.user._id`, preventing identity spoofing.
- Privacy: `.populate({ path: "reporterId", select: "name" })` explicitly exposes only the student's name, guaranteeing that emails and password hashes are never returned.

#### C. `server/src/services/statusService.js` — Dynamic Freshness Engine
```javascript
const DEFAULT_STALE_AFTER_MINUTES = 60;

function calculateFreshness(reportedAt, now = new Date(), thresholdMinutes = getStaleAfterMinutes()) {
    if (reportedAt === null || reportedAt === undefined) return "No Report";
    const reportTime = new Date(reportedAt).getTime();
    const currentTime = new Date(now).getTime();
    return currentTime - reportTime >= thresholdMinutes * 60 * 1000
        ? "Stale"
        : "Fresh";
}
```
- Mathematical formula: $\Delta t = 	ext{currentTime} - 	ext{reportedAt}$. If $\Delta t \ge 	ext{threshold} 	imes 60,000 	ext{ ms}$, freshness is `"Stale"`; otherwise `"Fresh"`.
- **Status Retention Rule:** A report that becomes `"Stale"` keeps its original availability status (e.g. `"Available"`). The status is never overwritten.

### 7.4 Files to Open During Viva
1. `server/src/models/SpaceReport.js` (Show foreign references and compound index)
2. `server/src/controllers/reportController.js` (Show `createReport` and safe population)
3. `server/src/services/statusService.js` (Show `calculateFreshness` formula)

### 7.5 Exact Speaking Script
> *"Good morning examiners. I am Arun Bhuddewar, Member 4 and the Availability Reporting and Freshness Developer for StudySpot.*  
>  
> *My responsibility was to engineer the crowd-sourced heartbeat of our system: availability reporting, history pagination, and our dynamic freshness engine.*  
>  
> *In `server/src/models/SpaceReport.js`, I designed our report schema. Every update records foreign keys to the study space and reporting user, an availability status, an optional note up to 300 characters, and an automated timestamp. I added a compound index on `{ spaceId: 1, reportedAt: -1 }` to guarantee sub-millisecond retrieval of the latest report.*  
>  
> *In `server/src/controllers/reportController.js`, I implemented authenticated report submission. Security and privacy were top priorities: the reporter's identity is derived strictly from the verified JWT in `req.user`, making reporter spoofing impossible. When reports are serialized for public display, my controller uses Mongoose field selection to populate only the student's name, ensuring email addresses and password hashes are never leaked.*  
>  
> *One of my most important contributions is `statusService.js`. We deliberately do NOT store freshness as a static database field, because a report that is fresh at 10:00 AM naturally becomes stale by 11:00 AM without any database update. My service calculates freshness dynamically at read time by comparing elapsed minutes against our configurable 60-minute threshold.*  
>  
> *Crucially, becoming stale never erases the report's availability. If a room was reported 'Available' 90 minutes ago, students can still see that it was available, while our UI clearly flags it as 'Stale' so they exercise caution.*  
>  
> *My module is verified by 16 passing automated tests. Member 5 Shaettha Kownain will now present our frontend integration and testing."*

### 7.6 15 Detailed Technical Viva Questions & Model Answers

1. **Why is freshness calculated dynamically at runtime rather than stored in MongoDB?**  
   *Answer:* Time is continuous. If we stored `freshness: "Fresh"` in the database, we would need a background cron job running constantly to update thousands of records to `"Stale"` as minutes elapse. Dynamic calculation on read is stateless, requires zero background write overhead, and is always 100% accurate.
2. **What happens to availability status when a report becomes stale?**  
   *Answer:* The availability status remains completely unchanged. For example, if a space was reported `"Available"` 2 hours ago, the status remains `"Available"`, while the freshness property evaluates to `"Stale"`. This informs students of the last known condition while cautioning that it is older.
3. **How do you prevent reporter ID spoofing?**  
   *Answer:* In `reportController.createReport`, `reporterId` is taken directly from `req.user._id`, which was verified and attached by `authMiddleware.authenticate`. Any client-supplied reporter ID in `req.body` is completely ignored.
4. **How do you protect student privacy in public report history?**  
   *Answer:* We use `.populate({ path: "reporterId", select: "name" })`. Mongoose explicitly selects only the `name` field, preventing email addresses, roles, and password hashes from appearing in the JSON response.
5. **What are the four valid report statuses?**  
   *Answer:* `"Available"`, `"Moderately Busy"`, `"Busy"`, and `"Temporarily Closed"`.
6. **How does report history pagination work in `getReportHistory`?**  
   *Answer:* The client passes `page` (default 1) and `limit` (default 10). The controller uses `.skip((page - 1) * limit).limit(limit).sort({ reportedAt: -1, _id: -1 })` along with `SpaceReport.countDocuments()` to return paginated reports and total page counts.
7. **What is the maximum limit allowed in report pagination?**  
   *Answer:* 100 reports per page, enforced by `parsePositiveInteger(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT)`.
8. **Can an unauthenticated user submit a report?**  
   *Answer:* No. `POST /api/spaces/:id/reports` passes through `authMiddleware.authenticate`. Unauthenticated calls return HTTP 401 Unauthorized.
9. **Can a student report on an inactive study space?**  
   *Answer:* No. `reportController.createReport` queries `StudySpace.findOne({ _id: spaceId, active: { $ne: false } })`. If the space is inactive or missing, it returns HTTP 404 Not Found.
10. **What is the purpose of the compound index `{ spaceId: 1, reportedAt: -1 }`?**  
    *Answer:* It creates an ordered B-tree index sorted by space ID and descending reported timestamp. When querying for the latest report or viewing paginated history, MongoDB reads directly from the pre-sorted index without an in-memory sort stage.
11. **Where is the freshness threshold configured?**  
    *Answer:* In `server/.env` via `STATUS_STALE_AFTER_MINUTES=60`. `statusService.getStaleAfterMinutes()` parses this variable, defaulting to 60 minutes if omitted.
12. **What does `serializeReport` return?**  
    *Answer:* The report document with `id` (as string), `createdAt` (matching `reportedAt`), calculated `freshness`, `freshnessThresholdMinutes`, and populated `reporterName`.
13. **What happens if a user submits a note with 500 characters?**  
    *Answer:* `createReport` rejects it with HTTP 400 Bad Request: `"Note must be 300 characters or fewer."`
14. **How does `getLatestReportStatus` handle a space with zero reports?**  
    *Answer:* It returns `{ report: null, status: null, reportedAt: null, freshness: "No Report" }` with HTTP 200 OK.
15. **Why do you use `SpaceReport.countDocuments({ spaceId })` instead of fetching all documents?**  
    *Answer:* `countDocuments` is an efficient MongoDB operation that counts indexed matching keys without transferring document data over the network, ensuring fast pagination metadata generation.

### 7.7 Likely Cross-Questions
- *Cross-Question:* "What if two students submit reports at the exact same millisecond?"  
  *Answer:* Each report is saved as an independent document with a unique ObjectId. In history queries, we sort by `{ reportedAt: -1, _id: -1 }`. The `_id` acts as a deterministic tie-breaker, ensuring consistent pagination ordering.
- *Cross-Question:* "How would you prevent a student from spamming 100 reports in one minute?"  
  *Answer:* In future work, we plan to implement rate limiting on `POST /api/spaces/:id/reports` using `express-rate-limit` (e.g. maximum 1 report per student per space every 5 minutes).

### 7.8 What Member 4 Must Prepare
- Open `server/src/models/SpaceReport.js`, `server/src/controllers/reportController.js`, and `server/src/services/statusService.js`.
- Be ready to explain the freshness formula on the whiteboard.
- Be ready to explain why stale reports keep their availability status.

## 8. Member 5 — Shaettha Kownain: Frontend Integration and Testing Lead

### 8.1 Responsibility Summary
Shaettha Kownain is the team's Frontend Integration and Testing Lead, and the repository maintainer. Her responsibility was to design and implement the entire React 18 / Vite 6 Single Page Application, engineer the Axios HTTP client with request and response interceptors, build the API adapter layer (`authApi`, `spacesApi`, `reportsApi`), manage global authentication and session restoration via `AuthContext`, implement role-gated routing (`ProtectedRoute`, `ModeratorRoute`), design all user-facing pages, resolve integration defects (specifically the space-edit payload bug), author the 17-test Vitest suite, and produce the project-level QA documentation.

### 8.2 Files to Explore
| File Path | Primary Responsibility | Important Methods / Logic | What to Explain | Connections |
|---|---|---|---|---|
| `client/src/App.jsx` & `main.jsx` | SPA entry point and route layout. | `App()`, `<BrowserRouter>`, `<AuthProvider>`, route hierarchy | Shell layout, public/protected/moderator routing. | Bootstraps React and mounts all pages. |
| `client/src/api/axios.js` | Axios HTTP client & interceptors. | `http`, request interceptor, response interceptor, `normalizeResponse` | Token injection, 401 unauth session reset, friendly error mapping. | Foundation for all frontend API calls. |
| `client/src/api/authApi.js` | Authentication API adapter. | `login()`, `register()`, `logout()`, `getCurrentUser()` | Dual-mode toggle, `sessionStorage` token management. | Used by `AuthContext`. |
| `client/src/api/spacesApi.js` | Study spaces API adapter. | `getSpaces()`, `getSpaceById()`, `createSpace()`, `updateSpace()`, `deactivateSpace()` | Query parameter stripping, URL encoding, response normalization. | Used by `SpacesPage` and `ModeratorDashboard`. |
| `client/src/api/reportsApi.js` | Availability reports API adapter. | `getSpaceReports()`, `createSpaceReport()` | Dual-mode calling, report creation with token. | Used by `SpaceDetailsPage`. |
| `client/src/context/AuthContext.jsx` | React Context for auth state. | `AuthProvider`, `useAuth()`, session restoration `useEffect` | Automatic session restore on refresh, `isModerator` helper. | Consumed across entire frontend. |
| `client/src/components/ProtectedRoute.jsx` | Client-side authentication guard. | `ProtectedRoute()` | Redirects unauthenticated users to `/login`. | Wraps authenticated routes in `App.jsx`. |
| `client/src/components/ModeratorRoute.jsx` | Client-side role authorization guard. | `ModeratorRoute()` | Restricts access to moderators; redirects members to `/spaces`. | Guards `/moderator` route. |
| `client/src/pages/SpacesPage.jsx` | Public study spaces catalog directory. | `loadSpaces()`, dynamic option building, search filter UI | Combined multi-filter querying, empty & error states. | Connects to `spacesApi` and `reportsApi`. |
| `client/src/pages/SpaceDetailsPage.jsx` | Space details and live report submission. | `load()`, `submitReport()`, 60-second freshness re-evaluation | Real-time report submission, status & freshness badge display. | Connects to `reportsApi` and `AuthContext`. |
| `client/src/pages/ModeratorDashboard.jsx` | Management portal for campus spaces. | `saveSpace()`, `confirmDeactivate()`, `SpaceEditor` | Space metrics, sanitized update payload, soft deactivation. | Connects to `spacesApi` and `reportsApi`. |
| `client/src/test/moderator-space-edit.test.jsx` | Regression test for space update payload. | `it("omits server-managed fields from the update payload")` | Verifies that `id` and timestamps are stripped before PATCH. | Tests `ModeratorDashboard.jsx`. |
| `docs/QA-REPORT-2026-11-03.md` | Comprehensive live QA audit report. | End-to-end live testing against Express & Atlas | Verifies 41 backend tests, 17 frontend tests, defect resolution. | Project QA record. |

### 8.3 Code Walkthrough — Function by Function

#### A. `client/src/api/axios.js` — Request/Response Interceptors & Error Normalization
```javascript
import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("studyspot-api-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("studyspot-api-token");
      sessionStorage.removeItem("studyspot-api-user");
      window.dispatchEvent(new Event("studyspot:unauthorized"));
    }
    error.userMessage = error.response?.data?.message || getFriendlyErrorMessage(error);
    return Promise.reject(error);
  }
);
```
- **Request Interceptor:** Automatically checks `sessionStorage` for `studyspot-api-token` and attaches `Authorization: Bearer <token>` on all outbound API calls.
- **Response Interceptor:** Catches HTTP 401 Unauthorized errors, clears storage, and fires `studyspot:unauthorized` to reset React authentication state. It normalizes server error responses into `error.userMessage` for consistent UI display.

#### B. `client/src/context/AuthContext.jsx` — Session Restoration & State Management
```javascript
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authApi.getCurrentUser()
      .then((currentUser) => { if (active) setUser(currentUser); })
      .catch((error) => console.error("Session restore failed", error))
      .finally(() => { if (active) setLoading(false); });

    const handleUnauthorized = () => setUser(null);
    window.addEventListener("studyspot:unauthorized", handleUnauthorized);
    return () => {
      active = false;
      window.removeEventListener("studyspot:unauthorized", handleUnauthorized);
    };
  }, []);

  const value = useMemo(() => ({
    user, loading, login, register, logout,
    isModerator: user?.role === "moderator"
  }), [user, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```
- On mount, `useEffect` calls `authApi.getCurrentUser()` (`GET /api/auth/me`). If a valid token exists in `sessionStorage`, the server returns the user and the session is restored without forcing a new login.
- Listens for `studyspot:unauthorized` to immediately clear user state if a token expires during usage.

#### C. `client/src/pages/ModeratorDashboard.jsx` — Space-Edit Payload Bug Fix
During live QA, editing a space initially failed with HTTP 400 Bad Request because the full space object was being spread into the PATCH body, transmitting server-managed fields like `id` and timestamps. Member 5 refactored the submission handler to send strictly editable fields:
```javascript
function submit(event) {
  event.preventDefault();
  const data = {
    name: values.name,
    building: values.building,
    area: values.area,
    description: values.description,
    facilities: facilitiesText.split(",").map((i) => i.trim()).filter(Boolean),
    quietZone: values.quietZone,
    groupStudyAllowed: values.groupStudyAllowed,
    active: values.active,
  }; // Server-managed fields (id, createdAt, updatedAt) are explicitly omitted
  const nextErrors = validateSpace(data);
  setErrors(nextErrors);
  if (!Object.keys(nextErrors).length) onSave(data);
}
```

### 8.4 Files to Open During Viva
1. `client/src/api/axios.js` (Show request and response interceptors)
2. `client/src/context/AuthContext.jsx` (Show session restore and `isModerator`)
3. `client/src/pages/ModeratorDashboard.jsx` (Show sanitized space update payload)
4. `client/src/test/moderator-space-edit.test.jsx` (Show automated regression test)

### 8.5 Exact Speaking Script
> *"Good morning respected professors and examiners. I am Shaettha Kownain, Member 5 and the Frontend Integration and Testing Lead for StudySpot.*  
>  
> *My role was to bring our entire project together: designing our React 18 Single Page Application, establishing our Axios HTTP transport pipeline, managing client-side authentication, implementing route protection, and ensuring total quality through automated testing and live integration QA.*  
>  
> *In `client/src/api/axios.js`, I created our centralized Axios instance. I engineered two critical interceptors: a request interceptor that automatically reads our 1-day JWT from `sessionStorage` and attaches it as a Bearer token to all outgoing API calls, and a response interceptor that catches 401 Unauthorized errors. If a session expires, the interceptor clears storage and dispatches a global event that immediately resets our authentication state.*  
>  
> *In `client/src/context/AuthContext.jsx`, I built our session restoration engine. When a student refreshes their browser, our context automatically calls `GET /api/auth/me` with their saved token, restoring their session seamlessly without forcing them to re-login. Our context also exposes `isModerator`, which powers our `ProtectedRoute` and `ModeratorRoute` guards.*  
>  
> *I designed all user-facing screens, including `SpacesPage.jsx` with real-time multi-filter search, `SpaceDetailsPage.jsx` with live report submission and a 60-second timer that re-evaluates freshness dynamically in the UI, and `ModeratorDashboard.jsx` for space administration.*  
>  
> *During our live QA testing, I identified and resolved a critical integration bug: our space editor was sending server-managed fields like `id` and timestamps in PATCH requests, which our backend validator rejected. I sanitized the update payload to transmit strictly editable fields and wrote a dedicated regression test in `moderator-space-edit.test.jsx` to guarantee it never recurs.*  
>  
> *Across our project, all 41 backend tests and 17 frontend tests pass with 100% success. We are now ready to demonstrate StudySpot live."*

### 8.6 15 Detailed Technical Viva Questions & Model Answers

1. **Why did you choose `sessionStorage` over `localStorage` for JWT storage?**  
   *Answer:* `sessionStorage` isolates data to the active browser tab session and is automatically purged when the tab or browser is closed. On shared university campus library computers, this prevents persistent token exposure if a student forgets to click "Log out", offering superior security compared to `localStorage`.
2. **What is an Axios Request Interceptor?**  
   *Answer:* A function that Axios executes before any HTTP request is transmitted over the network. Our request interceptor inspects `sessionStorage` for `studyspot-api-token` and automatically injects `Authorization: Bearer <token>` into the request headers.
3. **What is an Axios Response Interceptor?**  
   *Answer:* A function that Axios executes immediately when a response arrives from the server. If the server returns HTTP 401 Unauthorized, our interceptor clears invalid tokens from `sessionStorage` and dispatches `studyspot:unauthorized` to reset `AuthContext`. It also extracts server error messages into `error.userMessage`.
4. **How does `AuthContext` restore user sessions upon page refresh?**  
   *Answer:* In `AuthContext.jsx`, a mount `useEffect` calls `authApi.getCurrentUser()`, which sends `GET /api/auth/me` with the saved Bearer token. The backend verifies the token and returns the current user profile, restoring React state without requiring re-login.
5. **How does `ProtectedRoute` work?**  
   *Answer:* It reads `const { user, loading } = useAuth()`. If `loading`, it renders a loading spinner; if `user` exists, it renders the child route via `<Outlet />`; if `user` is null, it renders `<Navigate to="/login" replace state={{ from: location }} />`.
6. **How does `ModeratorRoute` work?**  
   *Answer:* It checks `const { user, isModerator, loading } = useAuth()`. If `!user`, it redirects to `/login`. If `user` exists but `isModerator` is false, it redirects the student member to `/spaces`. If `isModerator` is true, it renders the `<ModeratorDashboard />`.
7. **Explain the space-edit bug you identified and fixed during live QA.**  
   *Answer:* When editing a space, `ModeratorDashboard.jsx` originally spread the entire existing space object into the PATCH payload. This included server-managed fields: `id`, `_id`, `createdAt`, and `updatedAt`. The backend's `validateSpaceData` strictly rejects unknown keys, causing HTTP 400 Bad Request errors. I refactored the form to extract only mutable space fields and wrote a regression test in `moderator-space-edit.test.jsx`.
8. **What is the dual-mode architecture in your frontend API adapters?**  
   *Answer:* In `authApi.js`, `spacesApi.js`, and `reportsApi.js`, a boolean constant `const useMock = import.meta.env.VITE_USE_MOCK_API !== "false"` toggles whether calls hit the live Express REST API via Axios or local mock services in `client/src/services/`. This allows isolated frontend testing and development without a running backend.
9. **How does `SpaceDetailsPage.jsx` re-evaluate freshness without a page reload?**  
   *Answer:* It initializes a state variable `const [now, setNow] = useState(Date.now())` and uses `setInterval(() => setNow(Date.now()), 60_000)` to update `now` every 60 seconds. The component passes `now` to `FreshnessBadge`, recalculating freshness dynamically as time elapses.
10. **Why do you use `useCallback` for `loadSpaces` in `SpacesPage.jsx`?**  
    *Answer:* To memoize the fetch function so its reference does not change on every component render, preventing infinite re-render loops when passed to `useEffect([loadSpaces])`.
11. **What is the purpose of `useMemo` in `SpacesPage.jsx` for filter options?**  
    *Answer:* It calculates unique lists of buildings, areas, and facilities from the catalog spaces array and memoizes the result, recomputing only when the catalog spaces array changes.
12. **How does your frontend handle loading, error, and empty states?**  
    *Answer:* We use dedicated visual components: `<LoadingState label="..." />`, `<ErrorState message={error} onRetry={load} />`, and `<EmptyState title="...">`.
13. **How do you prevent duplicate form submissions during network delays?**  
    *Answer:* Form components maintain a `submitting` boolean state. While `submitting` is true, submit buttons are disabled and display loading text (e.g., "Sharing...", "Saving...").
14. **What tools are used for frontend testing?**  
    *Answer:* Vitest (test runner), React Testing Library (component rendering and DOM assertions), and jsdom (in-memory browser environment simulation).
15. **How many automated frontend tests exist, and did they pass?**  
    *Answer:* Exactly 17 tests across 6 test files, all passing with 100% success when mock mode is enabled for the test runner.

### 8.7 Likely Cross-Questions
- *Cross-Question:* "Why do client tests fail if `VITE_USE_MOCK_API=false` during testing?"  
  *Answer:* Vitest runs in an isolated Node/jsdom environment without a running Express server on port 5000. When mock mode is disabled, Axios attempts network calls to localhost:5000 and fails with connection errors. Setting `VITE_USE_MOCK_API=true` allows unit and component tests to execute reliably against deterministic mock services.
- *Cross-Question:* "Can a user open browser DevTools, edit React state, and become a moderator?"  
  *Answer:* A user could manipulate local React state to render the moderator UI, but any action they attempt (such as creating a space) dispatches an API request to Express. The backend's `authMiddleware` validates the cryptographic JWT and reloads their role from MongoDB, rejecting the request with HTTP 403 Forbidden.

### 8.8 What Member 5 Must Prepare
- Open `client/src/api/axios.js`, `client/src/context/AuthContext.jsx`, and `client/src/pages/ModeratorDashboard.jsx`.
- Be ready to run `$env:VITE_USE_MOCK_API="true"; npm --prefix client test` to demonstrate the 17 passing frontend tests.
- Be ready to show the payload fix in `ModeratorDashboard.jsx` and explain the live QA report.

---

## 9. Complete End-to-End User Journeys and Execution Traces

### Workflow 1: Student Member Registration
1. **User Action:** Student navigates to `/register`, enters name, email, password, and confirmPassword in `RegisterPage.jsx`, and clicks "Create account".
2. **Client Validation:** `validateRegistration(values)` confirms name length (2–80), email format regex, password length >= 8, and password equality.
3. **API Dispatch:** `AuthContext.register()` delegates to `authApi.register()` -> Axios issues `POST /api/auth/register`.
4. **Backend Router:** `authRoutes.js` routes to `authController.register`.
5. **Controller & Service:** `authController.register` calls `authService.register()`. It normalizes email, checks for duplicates, hashes password with bcrypt (12 rounds), assigns `role: "member"`, saves `User` document, and signs a 1-day JWT.
6. **Network Return:** Express returns HTTP `201 Created` with `{ success: true, data: { user, token } }`.
7. **Storage & Navigation:** `authApi` stores token and user in `sessionStorage`. `AuthContext` updates user state. React Router navigates to `/spaces`. Navbar displays student's name.

### Workflow 2: User Login and Session Restoration
1. **User Action:** User enters credentials into `LoginPage.jsx` and clicks "Log in".
2. **Client Validation:** `validateLogin(values)` checks for non-empty fields and email format.
3. **API Dispatch:** Calls `authApi.login()` -> Axios issues `POST /api/auth/login`.
4. **Controller & Service:** `authService.login()` queries `User.findOne({ email }).select('+passwordHash')`. It verifies password using `bcrypt.compare()`. On success, it returns a 1-day JWT and user profile.
5. **Session Storage:** `authApi` saves token and user in `sessionStorage`.
6. **Session Restoration:** On subsequent browser refreshes, `AuthContext`'s mount effect calls `GET /api/auth/me` with Bearer token. Server reloads user from MongoDB and restores active session.

### Workflow 3: Directory Browsing & Multi-Parameter Filtering
1. **User Action:** Student visits `/spaces`, types keyword `"Library"`, selects building `"Main Block"`, and checks `"Wi-Fi"`.
2. **Parallel Fetching:** `SpacesPage.jsx` executes `Promise.all([getSpaces(filters), getSpaces()])`. The second call retrieves the full catalog to build dynamic dropdown options.
3. **Backend Query Construction:** `spaceController.getSpaces` constructs MongoDB filter: `{ active: true, building: 'Main Block', facilities: 'Wi-Fi' }` and adds case-insensitive regex `$or` array for `"Library"`.
4. **Aggregation Filter:** If a status filter is selected, an aggregation pipeline on `SpaceReport` groups newest reports by `spaceId` and filters matching space IDs.
5. **Presentation:** Spaces are returned sorted alphabetically. `SpacesPage` fetches reports and maps spaces into `<SpaceCard />` components.

### Workflow 4: Availability Report Submission & Dynamic Freshness
1. **User Action:** Authenticated student on `/spaces/:id` selects `"Available"`, enters note `"Tables open on 2nd floor"`, and clicks "Share an update".
2. **Client Validation:** `ReportForm.jsx` validates status against `REPORT_STATUSES` and confirms note <= 300 characters.
3. **API Dispatch:** Calls `createSpaceReport(spaceId, reportData)` in `reportsApi.js`. Axios request interceptor attaches Bearer JWT from `sessionStorage`.
4. **Auth Middleware:** `authMiddleware.authenticate` verifies JWT signature, extracts `decoded.sub`, and queries `User.findById()`, setting `req.user`.
5. **Controller & DB:** `reportController.createReport` verifies active space, creates new `SpaceReport` document with `reporterId: req.user._id`, and saves to MongoDB.
6. **Population & Freshness:** Controller populates `reporterId.name` and calls `statusService.calculateFreshness(reportedAt)`. It returns HTTP `201 Created`.
7. **UI Update:** `SpaceDetailsPage` receives new report, prepends to history, updates latest status badge, and displays success toast.

### Workflow 5: Moderator Space Creation, Update & Soft Deactivation
1. **Access Guard:** Moderator navigates to `/moderator`. `ModeratorRoute` verifies `isModerator === true` and renders `ModeratorDashboard.jsx`.
2. **Space Creation:** Moderator clicks "Add space", enters details, and submits. `spaceController.createSpace` validates fields and saves space with `active: true`.
3. **Space Editing:** Moderator clicks "Edit". `SpaceEditor` submits sanitized payload (omitting `id` and timestamps) to `PATCH /api/spaces/:id`. Space details are updated.
4. **Soft Deactivation:** Moderator clicks "Deactivate" and confirms in modal. `spaceController.deactivateSpace` sets `space.active = false`.
5. **Public Impact:** Space is immediately excluded from public student searches, while all historical community reports remain intact in MongoDB.

## 10. End-to-End Live Demonstration Script

### 10.1 Live Demo Preparation & Test Accounts
Ensure the Express server is running on port 5000 (`npm --prefix server start`), MongoDB is connected, and the client is running on port 5173 (`npm --prefix client run dev`) with `VITE_USE_MOCK_API=false`.
- **Student Member Account:** `student.demo@sru.edu.in` / `StudySpot123!`
- **Moderator Account:** `moderator@sru.edu.in` / `StudySpot123!`

### 10.2 Live Demonstration Step-by-Step Table
| Step | Action on Screen | What to Say to Panel | Expected System Behavior |
|---|---|---|---|
| **1** | Open `http://localhost:5173/`. Show landing page. | *"This is the StudySpot landing page. It introduces our value proposition, sample campus areas, and clearly states that availability is community-reported."* | Navbar renders 'Find a space', 'Log in', 'Create account'. Hero illustration renders smoothly. |
| **2** | Click 'Find a space' to navigate to `/spaces`. | *"Here is our public campus directory. Notice all 5 campus spaces loaded from MongoDB with their building, facilities, and latest community status."* | Directory displays 5 spaces. Results counter shows '5 spaces'. Filter dropdowns populate dynamically. |
| **3** | Type 'Library' in search box; check 'Wi-Fi'. | *"Our directory supports real-time multi-parameter filtering. The catalog updates instantly without full page reloads."* | Space grid filters down to matching cards. Non-matching spaces are hidden. |
| **4** | Click 'Central Library Reading Hall'. | *"On the space detail page, we see detailed amenities, quiet-zone rules, current status, freshness badge, and complete report history."* | Renders description, facilities chips, status badge, freshness badge, and 'Log in to report' button. |
| **5** | Click 'Create account' to open `/register`. | *"Let's register a new student account to demonstrate crowdsourced availability reporting."* | Displays registration form with name, email, password, and confirmPassword. |
| **6** | Register `new.student@sru.edu.in` with `StudySpot123!`. | *"Our server validates inputs, hashes the password with 12-round bcrypt, issues a 1-day JWT, and logs the user in."* | Redirects to `/spaces`. Navbar displays student's name and 'Log out' button. |
| **7** | Reopen Central Library Reading Hall. | *"Because the student is now authenticated, the reporting form is unlocked."* | `ReportForm` component renders with status dropdown and 300-char note textarea. |
| **8** | Select 'Available', type note 'Plenty of desks open near east windows', submit. | *"When submitted, our Express API validates the report, persists it to MongoDB, and recalculates freshness."* | Success feedback appears. Report prepends to history list with 'Fresh' badge. |
| **9** | Click 'Log out'. Log in as `moderator@sru.edu.in`. | *"Now we log in as a campus staff moderator. Notice that our navigation immediately updates to reveal the 'Manage' portal."* | Navbar renders 'Manage' link with shield icon. Members cannot access this route. |
| **10** | Click 'Manage' to open `/moderator`. | *"This is our Moderator Dashboard. It presents facility statistics and administrative space management tools."* | Displays metrics bar (active spaces, reported spaces, stale reports) and management table. |
| **11** | Click 'Add space', enter QA space details, click 'Create space'. | *"Moderators can create new study spaces. The backend strictly validates fields and sets active to true."* | New row appears in table with 'Active' badge and success notification toast. |
| **12** | Click 'Deactivate' on the test space; confirm in modal. | *"When a moderator deactivates a space, our server performs a soft delete. The space is hidden from students, but all reports remain in MongoDB."* | Space listing state switches to 'Inactive'. Public directory hides it; existing reports remain intact. |

### 10.3 Suggested Opening and Closing Statements
- **Opening Statement (Member 5):**  
  > *"Good morning respected professors and examiners. Welcome to our presentation of StudySpot, a campus study space availability and discovery board. Our team of five members engineered this system to eliminate the daily frustration students face searching for quiet, well-equipped places to study. StudySpot bridges crowdsourced availability reporting with dynamic freshness tracking and administrative space governance. We will now present each technical layer of our application."*
- **Closing Statement (Member 5):**  
  > *"To conclude, StudySpot demonstrates how a modern MERN stack architecture can solve a real-world campus problem. Our core engineering decisions—separating availability status from time freshness, enforcing security boundaries strictly on the server, soft-deactivating spaces to protect audit integrity, and testing our system with 58 automated tests—ensure that StudySpot is reliable, secure, and ready for production deployment. Thank you for your time. We are now open for your questions."*

---

## 11. Whole-Project Cross-Question Bank (40 Comprehensive Viva Q&As)

1. **Why choose the MERN stack?**  
   *Answer:* Full-stack JavaScript unification, reactive component UI with React, asynchronous non-blocking REST API with Express/Node, and schema-flexible document persistence with MongoDB.
2. **What is a RESTful API?**  
   *Answer:* An architectural style using standard HTTP verbs (GET, POST, PATCH, DELETE) to manipulate stateless resources identified by URIs, returning structured JSON representations.
3. **What is the difference between PUT and PATCH?**  
   *Answer:* PUT replaces the entire resource document; PATCH partially updates only the supplied fields. We use PATCH for space updates because moderators often modify single fields (e.g. `quietZone`).
4. **What is Express middleware?**  
   *Answer:* Functions executing in the request-response cycle that inspect or modify `req` and `res`, invoke `next()`, or terminate the request (e.g., CORS, JSON parsing, authentication).
5. **What is a JSON Web Token (JWT)?**  
   *Answer:* A compact, URL-safe token format consisting of Header, Payload, and Signature, allowing stateless identity verification without server-side session memory.
6. **Why use bcrypt with 12 salt rounds?**  
   *Answer:* Bcrypt is an adaptive key-derivation function that incorporates an automatic per-password salt and heavy computational cost (12 rounds = 4096 iterations), defeating rainbow tables and GPU brute-force attacks.
7. **What is the difference between authentication and authorization?**  
   *Answer:* Authentication verifies identity (who you are, via email/password and JWT). Authorization verifies permissions (what you are allowed to do, via role checks).
8. **Why is `passwordHash` configured with `select: false`?**  
   *Answer:* To ensure password hashes are never returned by default in Mongoose queries, preventing accidental credential exposure in JSON responses.
9. **What is MongoDB compound indexing?**  
   *Answer:* Indexing multiple fields together (e.g., `{ active: 1, building: 1, area: 1 }`). It allows MongoDB to satisfy multi-field filters directly from the index tree in O(log N) time.
10. **What is an ObjectId in MongoDB?**  
    *Answer:* A 12-byte unique identifier containing a 4-byte timestamp, 5-byte random machine/process value, and a 3-byte incrementing counter.
11. **Why use soft-deletion (`active: false`) instead of hard deletion?**  
    *Answer:* Hard-deleting spaces would orphan historical `SpaceReport` documents. Soft-deleting hides spaces from students while preserving referential integrity and historical analytics.
12. **What is the difference between status and freshness?**  
    *Answer:* Status is a subjective student observation (`Available`, `Busy`). Freshness is an objective calculation of elapsed time (`Fresh` if < 60 mins, `Stale` if >= 60 mins). Stale reports keep their status.
13. **How does the status filter aggregation pipeline work?**  
    *Answer:* It sorts reports descending by timestamp, groups by `$spaceId`, picks the newest report's status via `$first`, matches the requested status, and returns matching space IDs to the space query.
14. **Why use MongoDB transactions for moderator invitations?**  
    *Answer:* To ensure atomic consumption: verifying the invite, marking `usedAt`, and creating the user document happen as a single ACID transaction, preventing token reuse.
15. **Why use `sessionStorage` instead of `localStorage` for JWTs?**  
    *Answer:* `sessionStorage` automatically purges when the browser tab closes, preventing token leaks on shared university library computers.
16. **What is an Axios Interceptor?**  
    *Answer:* Client middleware that intercepts outbound requests (injecting Bearer tokens) and incoming responses (handling 401 logouts and error normalization).
17. **What is React Router DOM and client-side routing?**  
    *Answer:* A routing library for SPAs that intercepts URL changes and renders components dynamically without requesting new HTML documents from the server.
18. **How do `ProtectedRoute` and `ModeratorRoute` work?**  
    *Answer:* They evaluate `AuthContext` state. `ProtectedRoute` redirects unauthenticated users to `/login`. `ModeratorRoute` redirects non-moderators to `/spaces`.
19. **What was the space-edit bug and how was it fixed?**  
    *Answer:* The form spread the full space object into PATCH, including server-managed fields (`id`, timestamps). The backend rejected unknown fields. We sanitized the payload to send strictly editable fields.
20. **How did you test the backend without a live database?**  
    *Answer:* Using `mongodb-memory-server` and `Supertest`. It runs an isolated MongoDB instance in RAM, avoiding cloud database pollution.
21. **How many total automated tests exist?**  
    *Answer:* Exactly 58 tests: 41 backend tests (Node test runner) and 17 frontend tests (Vitest), all passing with 100% success.
22. **What is a TTL (Time-To-Live) index?**  
    *Answer:* A MongoDB index that automatically purges documents after an expiration timestamp. Used in `ModeratorInvitation` to delete expired invites after 24 hours.
23. **What is the difference between HTTP 401 and HTTP 403?**  
    *Answer:* 401 means unauthenticated (missing or invalid token). 403 means authenticated but forbidden (insufficient role permissions).
24. **Why perform controller validation if Mongoose has schemas?**  
    *Answer:* Defense-in-depth: catching errors early provides clean user-friendly messages and prevents NoSQL injection attacks where query operators are injected in bodies.
25. **What is dual-mode architecture in your frontend?**  
    *Answer:* `VITE_USE_MOCK_API` toggles whether API adapters call the live Express REST backend or local mock services in `client/src/services/`.
26. **Why should `VITE_` variables never store secrets?**  
    *Answer:* Vite compiles `VITE_` variables directly into public JavaScript bundles sent to the browser, exposing them to anyone using browser DevTools.
27. **How do you prevent duplicate user registrations?**  
    *Answer:* Normalized lowercase emails, Mongoose `unique: true` indexing, pre-checks in `authService`, and handling MongoDB error code `11000`.
28. **What does the database seed script do?**  
    *Answer:* Upserts 5 campus study spaces, initial availability reports, and a seed reporter account using fixed ObjectIds so it is completely idempotent.
29. **What are the current limitations of StudySpot?**  
    *Answer:* Community reports rely on student honesty; invitations are URL-based without direct SMTP email sending; first moderator requires database seeding; no approval queue.
30. **What future enhancements would you add?**  
    *Answer:* Upvote/downvote verification trust scores, interactive indoor campus maps, automated push notifications for favorite spaces, and SendGrid email verification.
31. **What is the Virtual DOM in React?**  
    *Answer:* An in-memory lightweight representation of the real DOM. React computes differences (diffing) and updates only changed DOM nodes (reconciliation), ensuring high performance.
32. **Why use Vite over Webpack?**  
    *Answer:* Vite uses native ES modules during development and Esbuild for pre-bundling, delivering instant server start and lightning-fast Hot Module Replacement (HMR).
33. **What is Node.js non-blocking I/O?**  
    *Answer:* Node delegates I/O tasks (file system, database queries, network calls) to the operating system kernel via Libuv, allowing the single-threaded event loop to continue processing requests.
34. **What is CORS preflight?**  
    *Answer:* For non-simple HTTP requests (such as requests with `Authorization` headers), the browser sends an initial `OPTIONS` request to verify that the server permits the method and headers.
35. **What is the difference between Context API and Redux?**  
    *Answer:* Context API is built into React and ideal for low-to-medium frequency global state like authentication. Redux is an external library with strict action-reducer architecture suited for complex state trees.
36. **How does MongoDB document locking work?**  
    *Answer:* MongoDB uses WiredTiger storage engine with document-level concurrency control, allowing multiple write operations to execute concurrently on different documents.
37. **What is the purpose of `escapeRegex` in search queries?**  
    *Answer:* Escapes special regex characters (`.*+?^${}()|[]\`) to prevent syntax errors and Regular Expression Denial of Service (ReDoS).
38. **How does `SpaceDetailsPage` avoid infinite fetch loops?**  
    *Answer:* The `load` function is wrapped in `useCallback` with `id` as dependency, and called inside `useEffect([load])`.
39. **What is Supertest?**  
    *Answer:* A Node library for testing HTTP servers. It allows test suites to execute requests against Express route handlers without binding to physical network ports.
40. **How do you verify test coverage in StudySpot?**  
    *Answer:* Run `npm --prefix server test` (41 passing tests) and `cd client; $env:VITE_USE_MOCK_API="true"; npm test` (17 passing tests).

---

## 12. Master File Exploration Map

| Area | Exact File Path | Primary Entities & What to Inspect |
|---|---|---|
| **Server Bootstrap** | `server/server.js` | `startServer()`, config loader, `connectDB()` call, HTTP listener. |
| **Express Config** | `server/app.js` | CORS origin, `express.json()`, route mounting, health check, global error handler. |
| **Database Config** | `server/src/config/db.js` | `connectDB()` Mongoose bootstrapper, `process.exit(1)` on error. |
| **User Model** | `server/src/models/User.js` | `userSchema`, name, unique email, `passwordHash` (select: false), role enum. |
| **StudySpace Model** | `server/src/models/StudySpace.js` | `studySpaceSchema`, compound index `{ active, building, area }`. |
| **SpaceReport Model** | `server/src/models/SpaceReport.js` | `spaceReportSchema`, `spaceId` FK, `reporterId` FK, status enum, `reportedAt`. |
| **Invitation Model** | `server/src/models/ModeratorInvitation.js` | `moderatorInvitationSchema`, `tokenHash`, TTL index on `expiresAt`. |
| **Auth Controller** | `server/src/controllers/authController.js` | `register()`, `login()`, `getCurrentUser()`, `createModeratorInvite()`. |
| **Auth Service** | `server/src/services/authService.js` | `bcrypt.hash()`, `bcrypt.compare()`, `createToken()`, transaction handling. |
| **Invite Service** | `server/src/services/moderatorInvitationService.js` | `createModeratorInvitation()`, `consumeModeratorInvitation()` via transaction. |
| **Auth Middleware** | `server/src/middleware/authMiddleware.js` | `authenticate()` Bearer token verify, `authorizeRoles()` guard. |
| **Space Controller** | `server/src/controllers/spaceController.js` | `getSpaces()` multi-filter & aggregation, space CRUD, soft-delete. |
| **Report Controller** | `server/src/controllers/reportController.js` | `createReport()`, `getReportHistory()` pagination, `getLatestReportStatus()`. |
| **Status Service** | `server/src/services/statusService.js` | `calculateFreshness()`, `getLatestReport()`, `getLatestStatus()`. |
| **Database Seeder** | `server/scripts/seed.js` | `seedData()` idempotent upsert for 5 campus spaces and initial reports. |
| **React Entry** | `client/src/main.jsx` | `ReactDOM.createRoot`, `BrowserRouter`, `AuthProvider` wrapper. |
| **App Router** | `client/src/App.jsx` | Route switch, `MainLayout` shell, `ProtectedRoute`, `ModeratorRoute`. |
| **Auth Context** | `client/src/context/AuthContext.jsx` | `AuthProvider`, `useAuth()`, `login()`, `logout()`, `register()`, `isModerator`. |
| **Axios Transport** | `client/src/api/axios.js` | `http` instance, Bearer token interceptor, 401 response interceptor. |
| **API Adapters** | `client/src/api/*.js` | `authApi.js`, `spacesApi.js`, `reportsApi.js` dual-mode callers. |
| **Catalog Page** | `client/src/pages/SpacesPage.jsx` | `loadSpaces()`, `SearchFilters`, `SpaceCard` grid, empty/error states. |
| **Detail Page** | `client/src/pages/SpaceDetailsPage.jsx` | `getSpaceById`, `getSpaceReports`, `ReportForm`, `ReportHistory`, 60s tick. |
| **Dashboard Page** | `client/src/pages/ModeratorDashboard.jsx` | Metrics bar, `SpaceEditor` (sanitized payload), soft-deactivation modal. |
| **Backend Tests** | `server/tests/*.test.js` | 41 tests across auth, spaces, reports, and seed. |
| **Frontend Tests** | `client/src/test/*.jsx` | 17 tests covering status utilities, forms, routes, mock services, payload fix. |

---

## 13. Tests and Validation Checklist

### 13.1 Automated Test Execution Summary
- **Backend Tests:** 41 tests in `server/tests/` using Node.js test runner, Supertest, and `mongodb-memory-server`. **Status: 100% PASS (0 Failures).**
- **Frontend Tests:** 17 tests in `client/src/test/` using Vitest, React Testing Library, and jsdom. **Status: 100% PASS (0 Failures).**
- **Frontend Production Build:** `npm --prefix client run build` compiles Vite assets cleanly. **Status: PASS.**

### 13.2 Verification Commands
```sh
# Backend Test Suite
npm --prefix server test

# Frontend Test Suite (Mock Mode Enabled)
cd client
$env:VITE_USE_MOCK_API="true"; npm test

# Frontend Build
npm run build
```

---

## 14. Local Project Setup and Commands

1. **Clone Repository & Install Dependencies:**
   ```sh
   git clone https://github.com/SHAESTHA-KOWNANIN/studyspot.git
   cd studyspot
   npm --prefix server install
   npm --prefix client install
   ```
2. **Configure Environment:**
   - Copy `server/.env.example` to `server/.env` and supply valid `MONGO_URI` and `JWT_SECRET`.
   - Copy `client/.env.example` to `client/.env` and set `VITE_USE_MOCK_API=false`.
3. **Seed Database:**
   ```sh
   npm --prefix server run seed
   ```
4. **Start Application:**
   - Server: `npm --prefix server start` (Listening on port 5000)
   - Client: `npm --prefix client run dev` (Listening on port 5173)

---

## 15. Deployment and Environment Configuration

### Backend Variables (`server/.env`)
- `PORT=5000`
- `CLIENT_URL=http://localhost:5173`
- `MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/studyspot` *(Secret)*
- `JWT_SECRET=<32+ char secret>` *(Secret)*
- `STATUS_STALE_AFTER_MINUTES=60`

### Frontend Variables (`client/.env`)
- `VITE_USE_MOCK_API=false`
- `VITE_API_BASE_URL=http://localhost:5000/api`
- `VITE_STATUS_STALE_AFTER_MINUTES=60`

---

## 16. Technical Glossary

- **SPA (Single Page Application):** Web app loading a single HTML file and dynamically swapping views via JavaScript.
- **REST:** Stateless architectural style using HTTP verbs (GET, POST, PATCH, DELETE) to manipulate resources.
- **JWT:** Compact token transmitting cryptographically signed claims for stateless authorization.
- **Bcrypt:** Adaptive key-derivation password hashing function with automatic salting and configurable work factor.
- **Mongoose ODM:** Modeling library managing schemas, validation, and relationships over MongoDB.
- **CORS:** Browser security mechanism governing cross-origin HTTP requests.
- **Compound Index:** Index spanning two or more fields, optimizing multi-attribute query execution.
- **Soft Deletion:** Setting an active flag to false rather than physically deleting documents.
- **Axios Interceptor:** Client middleware modifying outgoing requests (adding tokens) or incoming responses.
- **Idempotence:** Property where executing an operation multiple times produces the exact same outcome.
- **TTL Index:** MongoDB index automatically deleting documents when an expiration timestamp is reached.

---

## 17. Production Troubleshooting Map

| Failure Scenario | Probable Cause | Diagnostic Check | Resolution |
|---|---|---|---|
| **Server startup exits immediately** | Invalid `MONGO_URI` or Atlas IP whitelist block. | Check console: "MongoDB connection failed". | Whitelist current IP in Atlas Network Access; verify username/password in `server/.env`. |
| **API returns 401 Unauthorized** | Missing or expired JWT in `sessionStorage`. | Inspect request headers in browser DevTools Network tab. | Log in again; confirm Axios interceptor attaches `Authorization: Bearer <token>`. |
| **API returns 403 Forbidden** | User is authenticated as `'member'`, but route requires `'moderator'`. | Check `req.user.role` or decoded JWT payload. | Verify user role; only moderators can access space CRUD or invite generation. |
| **Space edit fails with 400** | Transmitting server-managed fields (`id`, timestamps). | Inspect PATCH request payload. | Verify `SpaceEditor` sends strictly editable fields; run regression test. |
| **CORS error in browser** | `CLIENT_URL` in `server/.env` does not match client origin. | Check browser console CORS error message. | Update `CLIENT_URL=http://localhost:5173` in `server/.env` and restart server. |
| **Catalog shows zero spaces** | Spaces soft-deactivated (`active: false`) or seed unrun. | Query MongoDB `studyspaces.countDocuments()`. | Run `npm --prefix server run seed` to populate active spaces. |
| **Frontend tests fail on network** | `VITE_USE_MOCK_API` set to `false` during testing. | Check Vitest console: "Unable to connect to server". | Run tests with `$env:VITE_USE_MOCK_API="true"; npm test`. |

---

## 18. How to Answer Deep Questions Confidently & Readiness Checklist

### 18.1 Universal 7-Step Viva Answer Formula
1. **User Action:** *"When the student clicks 'Share an update'..."*
2. **Frontend Handler:** *"The UI executes `handleSubmit()` in `ReportForm.jsx` and validates with `validateReport()`..."*
3. **HTTP Transport:** *"It dispatches `createSpaceReport()` in `reportsApi.js`, issuing `POST /api/spaces/:id/reports` with a Bearer token..."*
4. **Middleware:** *"Express routes it through `authMiddleware.authenticate`, which verifies the JWT and loads `req.user`..."*
5. **Controller:** *"`reportController.createReport` validates the status and verifies the space is active..."*
6. **Database:** *"It persists a new `SpaceReport` document in MongoDB and calls `statusService` to compute freshness..."*
7. **Response & UI:** *"Express returns HTTP 201 Created with the serialized report, and React prepends it to the history list with a success toast."*

### 18.2 Final Team Readiness Checklist
- [x] **Varsha Chukka (M1):** Can explain `server.js` startup, Mongoose connection, CORS, and seed idempotence.
- [x] **Syed Abdul Mateen (M2):** Can explain bcrypt (12 rounds), JWT lifecycle, auth middleware, and invitation transactions.
- [x] **Kranthi Chint (M3):** Can explain `StudySpace` compound indexing, multi-filter search aggregation, and soft-deactivation.
- [x] **Arun Bhuddewar (M4):** Can explain `SpaceReport` schema, report submission, safe population, and runtime freshness.
- [x] **Shaettha Kownain (M5):** Can explain React SPA architecture, Axios interceptors, route guards, and space-edit payload fix.
- [x] **Automated Tests:** 41 backend tests and 17 frontend tests verified passing with 100% success.
- [x] **Demo Accounts Ready:** `student.demo@sru.edu.in` and `moderator@sru.edu.in` (password `StudySpot123!`).
- [x] **Security Verified:** No credentials or environment secrets committed to Git or shown on slides.
