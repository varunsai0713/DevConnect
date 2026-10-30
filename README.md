# DevConnect

DevConnect is a developer collaboration platform for discovering peers and projects, pitching ideas, and collaborating in real-time Teams-style workspaces. It features a dark-themed React web interface with a persistent App Shell and a Spring Boot backend secured by JWT authentication and two-layer Role-Based Access Control (RBAC).

---

## Architecture & Workspaces Overview

### 1. Teams-Style App Shell & Workspaces
- **Persistent App Shell**: All authenticated views live inside a desktop icon rail (64–72px) / mobile bottom navigation bar (`/dashboard` for Feed, `/workspaces` for real-time collaboration, `/activity` for notifications).
- **Three-Pane Workspace Layout**:
  - **Left pane**: Workspaces switcher, channel list with unread badges, pending join requests modal (owner only), and channel creation.
  - **Middle pane**: Real-time channel chat history with cursor-based pagination, plain text rendering (max 4,000 characters), optimistic sends with retry on failure, and live typing indicator.
  - **Right pane**: Workspace members list with real-time online/offline presence indicators.

### 2. Two-Layer Role-Based Access Control (RBAC)
- **Global User Roles**:
  - `USER`: Default role. Can pitch projects, participate in discussions, create workspaces for own projects, and join other workspaces.
  - `ADMIN`: Moderation role. Can access `/api/admin/**` to list all system workspaces and delete workspaces for moderation. Admins **cannot** read message contents of workspaces they do not belong to.
- **Workspace Roles**:
  - `OWNER`: Project creator. Can create channels, accept/decline join requests, remove members, and delete the workspace.
  - `MEMBER`: Accepted collaborators. Can read and post messages in all workspace channels.

#### Local Admin Bootstrap
The backend automatically initializes an administrative account on startup if configured:
- Set environment variables `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` (or configure in `.env`).
- Defaults if unset: `admin` / `admin@devconnect.local` with password `AdminPass123!`.

---

## Real-Time Chat & WebSocket STOMP Specification

Real-time collaboration is powered by Spring Boot WebSocket with STOMP and `@stomp/stompjs` on the React frontend.

### STOMP Connection Handshake
- **Endpoint**: `/ws`
- **Authentication**: JWT token must be supplied in the STOMP `CONNECT` frame header:
  ```text
  CONNECT
  Authorization: Bearer <jwt_token>
  ```
- Unauthenticated or expired tokens are immediately rejected with an error frame and disconnected.
- Heartbeats are configured at 10-second intervals for connection health and automatic cleanup of disconnected sessions.

### Topics (Subscriptions)
- `/topic/channels/{channelId}`: Receives broadcasted `ChatMessageResponse` payloads after persistence to PostgreSQL.
- `/topic/channels/{channelId}/typing`: Ephemeral typing indicator events (`{ "userId": 1, "fullName": "Jane Doe", "typing": true }`). Not persisted to database.
- `/topic/workspaces/{workspaceId}/presence`: Broadcasts member status (`{ "userId": 1, "online": true | false }`) on connect/disconnect.
- `/user/queue/errors`: Receives per-user error notifications (e.g., rate limit violations or authorization denials).

### Application Destinations (Client Sends)
- `/app/channels/{channelId}/send`: Send a new message.
  ```json
  {
    "content": "Hello world",
    "clientMessageId": "3b29c9a0-6214-41d3-a4c8-2fb0d5a23f4b"
  }
  ```
  - `content`: Trimmed, max 4,000 characters, rendered as plain text only (never HTML).
  - `clientMessageId`: Client-generated UUID to guarantee idempotency and prevent duplicate messages on network retries.
- `/app/channels/{channelId}/typing`: Broadcast typing status (`{ "typing": true | false }`).

### REST Chat Endpoints
- `GET /api/channels/{channelId}/messages?limit=30&before={messageId}`: Cursor-based message history pagination ordered by server timestamp.
- `POST /api/channels/{channelId}/read`: Marks channel read up to the latest known `messageId` and clears unread badges.

### Per-User Send Rate Limiting
- Enforced on the server inside the WebSocket channel interceptor.
- Max **20 messages per 10 seconds** sliding window per authenticated user. Exceeding the rate limit returns an error frame to `/user/queue/errors` without disconnecting the user.

---

## Single-Instance In-Memory Broker Limitation

> [!IMPORTANT]
> DevConnect currently utilizes Spring's built-in in-memory message broker (`registry.enableSimpleBroker("/topic", "/queue")`).
> - **Single-Instance Restriction**: Real-time broadcasts, active session tracking, and ephemeral typing indicators are contained entirely within memory of a single running backend instance.
> - **Horizontal Scaling**: If scaling to multiple backend instances behind a load balancer, an external STOMP message broker relay (such as RabbitMQ or Apache ActiveMQ Artemis) must be enabled via `registry.enableStompBrokerRelay(...)`.

---

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, `@stomp/stompjs`, Tailwind CSS, Lucide React |
| Backend | Java 17, Spring Boot 3.2, Spring WebSocket & STOMP, Spring Security, Spring Data JPA |
| Database | PostgreSQL 15, Hibernate ORM, H2 (for integration tests) |

---

## Requirements

- Node.js (v18+) and npm
- Java 17 or newer
- Docker Desktop (for local PostgreSQL)

---

## Running Locally

### 1. Start Database & Backend Services
Copy `.env.example` to `.env` if not already present. Start PostgreSQL, frontend, and backend together:

```powershell
npm --prefix frontend install
npm run dev
```

Alternatively, to run the services individually:

**Start PostgreSQL:**
```powershell
docker compose up -d
```

**Run Backend (Spring Boot):**
```powershell
.\backend\mvnw.cmd -f backend\pom.xml spring-boot:run
```

**Run Frontend (React + Vite):**
```powershell
npm --prefix frontend run dev
```

Frontend runs at `http://localhost:3000` (or `http://localhost:5173`); backend REST and WebSocket APIs run at `http://localhost:8080`.

---

## Running the Automated Test Suite

DevConnect features comprehensive integration tests covering RBAC, workspace membership rules, STOMP authentication, cursor pagination, message deduplication, and rate limiting:

```powershell
.\backend\mvnw.cmd -f backend\pom.xml test
```

### Verified Test Suites:
1. `ChatAndRateLimitIntegrationTest`:
   - Duplicate `clientMessageId` idempotency (deduplicated at database level).
   - Cursor-based pagination ordering and stability without duplicate messages.
   - Sliding window rate limiting: allows 20 messages, blocks 21st within 10 seconds.
   - Channel read state tracking and unread counter resets.
2. `WebSocketIntegrationTest`:
   - STOMP `CONNECT` authentication with JWT Bearer header.
   - Topic subscription to `/topic/channels/{channelId}`.
   - Real-time message publication to `/app/channels/{channelId}/send` and receipt.
3. `RbacSecurityIntegrationTest`:
   - Non-admin access to `/api/admin/**` returns 403 Forbidden.
   - Admin access to `/api/admin/workspaces` returns 200 OK.
4. `WorkspaceMembershipIntegrationTest`:
   - Non-members blocked with 403 from workspace channels and details.
   - Owner can create channels; regular members receive 403 Forbidden.
   - Accepted join requests promote users to `MEMBER`.
   - Removed members immediately lose workspace access.

---

## How to Test Real-Time Collaboration with Two Browsers

To test real-time chat, presence, and permissions:

1. **Open User A (Owner)**:
   - In Chrome, open `http://localhost:3000` and sign in (or register `owner@devconnect.local`).
   - Go to **Feed**, click **Pitch Project**, and fill out the form.
   - On the created project card, click **Create workspace**. You will be redirected to `/workspaces` as the `OWNER`.

2. **Open User B (Collaborator)**:
   - Open an **Incognito Window** (or another browser like Edge/Firefox) at `http://localhost:3000`.
   - Register a second user `member@devconnect.local`.
   - Go to **Feed**, find User A's project pitch, and click **Connection Handshake** (sends a join request).

3. **Accept Join Request**:
   - Return to User A's browser. Notice the notification badge in **Activity** and the yellow counter on the **Pending Requests** button in Workspaces.
   - Click **Pending Requests** and click **Accept**. User B is now a `MEMBER`.

4. **Test Real-Time Chat & Presence**:
   - In both browser windows, navigate to `/workspaces`.
   - **Live Presence**: Both users see green online status dots next to each other's name in the right Members pane.
   - **Typing Indicator**: When User B types in the message input, User A instantly sees `member is typing...`.
   - **Instant Messaging**: Type a message and press `Enter`. The message renders optimistically, saves to PostgreSQL, and broadcasts in real time to both screens with sender avatar and timestamp.
   - **Pagination**: Scroll up to trigger cursor pagination loading older messages seamlessly.
   - **Spam / Rate Limit Protection**: Quickly sending more than 20 messages triggers a sliding window rate limit warning toast without disrupting the STOMP session.
