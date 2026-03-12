# Calendar Scheduler

A scheduling application built with Next.js and NestJS that integrates with Google Calendar. Users can log in with their Google account, view their upcoming events, create new events that sync to Google Calendar, and pull the latest changes from Google at any time.

---

## Tech Stack

- **Next.js 15** — frontend (port 3001)
- **NestJS 11** — REST API (port 3000)
- **PostgreSQL** — database (managed via Docker)
- **Prisma** — ORM and database migrations
- **Google Calendar API** — OAuth 2.0 authentication and calendar sync
- **Docker + Docker Compose** — containerized local environment

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- A Google Cloud project with OAuth 2.0 credentials (see setup below)

---

## Google OAuth Setup

You need Google OAuth credentials before the app will work.

1. Go to [Google Cloud Console](https://console.cloud.google.com) and open your project (or create one).
2. Navigate to **APIs & Services > Credentials**.
3. Click **Create Credentials > OAuth 2.0 Client ID**.
4. Set the application type to **Web application**.
5. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/auth/google/callback
   ```
6. Click **Create** and copy the **Client ID** and **Client Secret**.
7. Go to **APIs & Services > Library**, search for **Google Calendar API**, and enable it.

---

## Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in the values you got from Google Cloud:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

Also replace the JWT secrets with any random strings of at least 32 characters:

```
JWT_ACCESS_SECRET=replace_with_a_long_random_string
JWT_REFRESH_SECRET=replace_with_another_long_random_string
```

Everything else in `.env` can stay as the defaults from `.env.example`.

---

## Running the App

```bash
docker compose up --build
```

Once all containers are healthy:

- Frontend: http://localhost:3001
- API: http://localhost:3000

The database migrations run automatically on API startup.

---

## Stopping and Resetting

Stop all containers:

```bash
docker compose down
```

Stop and wipe all database data (fresh start):

```bash
docker compose down -v
```

---

## How It Works

Sign in with your Google account to authorize the app. On login, your upcoming Google Calendar events are pulled and stored in the local database. From the calendar view you can create new events, which are saved locally and pushed to your Google Calendar. Use the **Sync** button in the header to pull the latest events from Google Calendar at any time.

---

## Not Yet Implemented

These are known gaps that would be part of a production-ready version of this project:

- **Postman collection** — a documented collection of all API endpoints with example requests and responses, making it easier for new developers to explore and test the API without reading source code.

- **Unit and integration tests (Jest)** — test coverage for service logic and API endpoints. This would also fulfill a remaining project requirement and serve as a safety net for future changes.

- **CI/CD with GitHub Actions** — a workflow that runs the Jest test suite on every pull request and enforces passing tests as a required check before a branch can be merged. This prevents regressions from reaching the main branch.
