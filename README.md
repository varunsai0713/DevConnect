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
| Database | PostgreSQL 15, managed locally with Docker Compose |

## Requirements

- Node.js and npm
- Java 17 or newer
- Docker Desktop (running)

## Run locally

Copy `.env.example` to `.env` before the first run, and replace its JWT signing key with a private random value. The example database credentials are for local development only; use strong secrets for deployment. Install frontend dependencies once, then start the app from the repository root:

```powershell
npm --prefix frontend install
npm run dev
```

The dev command starts PostgreSQL with Docker Compose, then starts the frontend and Spring Boot API. Open the Vite URL printed in the terminal (normally `http://localhost:3000`); the API is at `http://localhost:8080`. Press `Ctrl+C` to stop the frontend and API. PostgreSQL data persists in the `pgdata` Docker volume.

User registration, sign-in, and profile setup are stored in PostgreSQL. Passwords are BCrypt-hashed. The project/discussion demo content is still stored in browser `localStorage`.

To verify the saved user records, run this from the repository root while the app is running:

```powershell
docker compose exec db psql -U postgres -d devconnect -c "SELECT id, username, email FROM users;"
```

If you change `DB_USERNAME` in `.env`, use that value instead of `postgres` in the command.

## API overview

The backend API is served under `/api`:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Register an account |
| `POST` | `/api/auth/signin` | Sign in and receive a JWT |
| `GET` | `/api/users` | List developer profiles |
| `GET`, `PUT` | `/api/users/me` | Read or update the signed-in user's profile |
| `GET`, `PUT` | `/api/users/{id}` | Read a profile or update your own profile |
| `GET`, `POST` | `/api/projects` | List and create projects |
| `GET`, `PUT` | `/api/projects/{id}` | Read a project or like it |
| `GET`, `POST` | `/api/discussions` | List and create discussions |
| `GET` | `/api/discussions/{id}` | Read a discussion |
| `PUT` | `/api/discussions/{id}/upvote` | Upvote a discussion |

## Build

Build the frontend:

```powershell
npm --prefix frontend run build
```

Package the backend:

```powershell
.\backend\mvnw.cmd -f backend\pom.xml package
```

To build and run the backend Docker image from the repository root:

```powershell
.\backend\mvnw.cmd -f backend\pom.xml package
docker build -f backend\Dockerfile -t devconnect-backend .
docker run --rm -p 8080:8080 devconnect-backend
```

## Repository layout

```text
.
├── frontend/                 React + Vite application
│   ├── src/
│   │   ├── App.jsx           Routes
│   │   ├── context/          Shared frontend state
│   │   └── pages/            Landing, sign-in, sign-up, dashboard, etc.
│   ├── index.html            Vite HTML entry
│   ├── package.json          Frontend dependencies and scripts
│   └── vite.config.js        Vite configuration
├── backend/                  Spring Boot API
│   ├── src/main/java/        Backend Java source
│   ├── pom.xml               Maven configuration
│   └── Dockerfile            Backend container image
├── docker-compose.yml        Local PostgreSQL service
└── README.md
```

Frontend source files live in `frontend/src/` (for example, `frontend/src/pages/SignInPage.jsx`).

## License

No license has been specified for this project yet.
