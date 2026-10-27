# Copilot instructions for DevConnect

## Project overview

DevConnect is a full-stack developer community app with:

- A Vite + React frontend in `frontend/`
- A Spring Boot + Java backend in `backend/`
- A local PostgreSQL instance started via Docker Compose from the repository root
- A root-level dev runner in `scripts/dev.js` that starts the database, frontend, and backend together

The active app is the root-level `frontend/` and `backend/` pair. The nested `DevConnect/` directory appears to be a duplicate/legacy copy and should not be treated as the main source of truth unless a task explicitly calls for it.

## Build, test, and lint commands

Run the app from the repository root:

```powershell
npm run dev
```

This loads `.env` values, starts PostgreSQL with Docker Compose, and launches both the frontend and backend.

Frontend build:

```powershell
npm --prefix frontend run build
```

Backend build/tests:

```powershell
./backend/mvnw.cmd -f backend/pom.xml test
```

Backend package/build:

```powershell
./backend/mvnw.cmd -f backend/pom.xml package
```

Single backend test (if tests are added later):

```powershell
./backend/mvnw.cmd -f backend/pom.xml -Dtest=YourTestClass test
```

Frontend has no dedicated test runner configured in `frontend/package.json`; the repository currently validates frontend changes primarily with the Vite production build.

## High-level architecture

### Frontend

`frontend/src/App.jsx` defines the top-level router and page layout:

- `/` landing page
- `/login`, `/signup`, `/forgot-password`, `/verify-email`
- `/profile-setup`
- `/dashboard`

Shared frontend state lives in `frontend/src/context/DevConnectContext.jsx`, and the central API wrapper is `frontend/src/api/client.js`. The wrapper reads the JWT from `localStorage` and sends it as the `Authorization` header for all requests.

The app uses browser-local demo data for many flows (`localStorage`), so some screens are interactive without a live backend connection. The README describes the backend API as the real persistence layer, but the front-end demo data is not yet fully wired to it everywhere.

### Backend

The backend is a Spring Boot app under `backend/src/main/java/com/devconnect/backend`:

- `controller/` contains REST endpoints for auth, users, projects, and discussions
- `model/` defines JPA entities
- `repository/` contains Spring Data repositories
- `config/` contains app and security configuration
- `security/` contains JWT parsing/filtering and user-details loading

Security is enforced in `SecurityConfig.java`: public routes are limited to `/api/auth/**`, and all other endpoints require authentication. The backend also configures CORS for local Vite/React origins (`localhost:3000`, `3001`, `3002`, `5173`).

### Data flow

- The frontend sends requests through `apiRequest()`.
- The backend authenticates users with Spring Security and JWTs.
- PostgreSQL is the persistence layer for user accounts and related data.
- Docker Compose defines the local DB service in `docker-compose.yml` and persists its data in the `pgdata` Docker volume.

## Key conventions and repository-specific patterns

- Use the repository root for local app startup; the root `scripts/dev.js` orchestrates Docker + frontend + backend.
- Keep the active application in `frontend/` and `backend/`. Avoid editing the duplicate `DevConnect/` tree unless the task is explicitly about that copy.
- The app expects a local `.env` file derived from `.env.example` before the first run. The backend reads DB credentials and JWT secret values from that file.
- Local development uses PostgreSQL at `localhost:5432` with default credentials from `.env.example` (`postgres` / `postgres`).
- JWT configuration is a repo convention: authentication uses a bearer token stored in browser local storage and validated on the backend.
- Frontend networking is centralized in `frontend/src/api/client.js`; prefer this helper for API calls instead of ad hoc `fetch` calls sprinkled throughout components.
- The backend is organized by feature area rather than technical layer alone: `controller`, `model`, `repository`, and `security` are the main boundaries.
- The README is the main source of truth for local run commands and API behavior; if a task touches runtime setup or endpoint contracts, confirm the docs before changing behavior.

## Working notes for future Copilot sessions

- If you need to change runtime behavior, start from the app entry points (`frontend/src/App.jsx`, `frontend/src/context/DevConnectContext.jsx`, and `backend/.../config/SecurityConfig.java`) before drilling into page-specific files.
- When verifying frontend changes, use the Vite build and the repo-level dev runner rather than assuming a browser-only check is enough.
- When validating backend changes, prefer the Maven test/package flow over ad hoc startup commands.
- The project is a community app with a demo front-end and a REST API, so feature work often spans both sides: frontend route behavior, API contract, and local auth/session flow.
