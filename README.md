# CRUD Notes App

This project has two apps:

- `backend` (Node.js + Express + PostgreSQL)
- `frontend` (React + Vite)

You can run everything from the root folder.

## Prerequisites

- Node.js 18+
- PostgreSQL running locally

## Database Config

Backend reads environment values from:

- `backend/.env`

Required keys:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_DATABASE`
- `PORT`

## Root Commands

From the project root:

1. Install backend and frontend dependencies:

```bash
npm run install:all
```

2. Run backend + frontend in development:

```bash
npm run dev
```

3. Run only backend:

```bash
npm run dev:backend
```

4. Run only frontend:

```bash
npm run dev:frontend
```

5. Build frontend and serve everything from backend (single server mode):

```bash
npm run serve:fullstack
```

In single server mode, open:

- http://localhost:5001

## Notes

- API routes are served under `/api`.
- Uploads are served under `/uploads`.
- If frontend build is missing, run `npm run build:frontend` or `npm run serve:fullstack`.
