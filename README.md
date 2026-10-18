# DevConnect

DevConnect is a developer community app for discovering people and projects, sharing ideas, and joining technical discussions. It includes a React web interface and a Spring Boot REST API.

## Features

- Landing page, sign-up, sign-in, password recovery, and profile setup screens
- Developer dashboard with profiles, projects, and discussions
- Frontend demo data persisted in the browser with `localStorage`
- Backend REST endpoints for authentication, users, projects, and discussions
- JWT-based authentication in the backend

> The current frontend demo stores its app data in browser storage; it is not yet wired to the Spring Boot API.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router |
| Styling and animation | Tailwind CSS, Motion |
| Icons | Lucide React |
| Backend | Java 17, Spring Boot, Spring Security, Spring Data JPA |
| Database | H2 by default; PostgreSQL is also included as a runtime dependency |

## Requirements

- Node.js and npm
- Java 17 or newer

## Run locally

Open two terminals at the repository root.

### 1. Start the backend

In the first terminal, run:

```powershell
.\backend\mvnw.cmd -f backend\pom.xml spring-boot:run
```

The API starts at `http://localhost:8080`. By default, it uses an in-memory H2 database.

### 2. Start the frontend

In the second terminal, run:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (the project is configured to use port `3000`).

## API overview

The backend API is served under `/api`:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Register an account |
| `POST` | `/api/auth/signin` | Sign in and receive a JWT |
| `GET`, `POST` | `/api/users` | List and create users |
| `GET`, `PUT` | `/api/users/{id}` | Read and update a user |
| `GET`, `POST` | `/api/projects` | List and create projects |
| `GET`, `PUT` | `/api/projects/{id}` | Read a project or like it |
| `GET`, `POST` | `/api/discussions` | List and create discussions |
| `GET` | `/api/discussions/{id}` | Read a discussion |
| `PUT` | `/api/discussions/{id}/upvote` | Upvote a discussion |

## Build

Build the frontend:

```powershell
npm run build
```

Package the backend:

```powershell
.\backend\mvnw.cmd -f backend\pom.xml package
```

## Repository layout

```text
src/       React frontend
backend/   Spring Boot API
```

## License

No license has been specified for this project yet.
