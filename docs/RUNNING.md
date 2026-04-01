# Running the Civiceye Project (Backend + Frontend)

This document explains how to run the backend and frontend locally, default credentials, and quick test/run commands.

## Prerequisites
- Node.js (v18+ recommended)
- npm (or yarn)
- MongoDB accessible locally or via connection string

## Backend (server)

1. Open a terminal and run:

```bash
cd backend
npm install
```

2. Configuration
- The project uses a small `backend/config.js` for defaults. You can override by setting environment variables before starting the server.
- Important defaults (see `backend/config.js`):
  - Admin email: `shreegowda211@gmail.com`
  - Admin password: `Admin@shree1`

3. Start the server (development):

```bash
cd backend
npm run dev
```

The backend listens on port `7000` by default. API root: `http://localhost:7000/api`.

Notes:
- Uploaded files are saved to the `uploads/` directory (ensure it exists and is writable).
- The backend does not require additional env vars to run, but you should provide a `MONGO_URI` (or run a local MongoDB instance) if you modify `db.js` to use env variables.

## Frontend (admin / citizen / officer UI)

1. Install dependencies and run dev server:

```bash
cd civiceye-project
npm install
npm run dev
```

2. Environment
- The frontend uses `VITE_API_URL` to locate the backend API. By default the frontend expects `http://localhost:7000/api`.
- To override, create a `.env` in `civiceye-project` with:

```
VITE_API_URL=http://localhost:7000/api
```

3. Default ports
- Vite dev server: `5173` (open `http://localhost:5173`)

## Quick API examples

1) Admin login (uses default admin credentials from `backend/config.js`):

```bash
curl -X POST http://localhost:7000/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"shreegowda211@gmail.com","password":"Admin@shree1"}'
```

2) Citizen register / login

```bash
# register
curl -X POST http://localhost:7000/api/citizen/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","password":"pass1234"}'

# login
curl -X POST http://localhost:7000/api/citizen/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"pass1234"}'
```

3) Create complaint (multipart with image):

```bash
curl -X POST http://localhost:7000/api/citizen/complaints \
  -H "auth-token: <CITIZEN_TOKEN>" \
  -F "title=Broken streetlight" \
  -F "description=The streetlight in front of 42 Elm is broken" \
  -F "category=Streetlight" \
  -F "location=42 Elm Street" \
  -F "image=@/path/to/photo.jpg"
```

## Tests
- The repository includes some test utilities and configurations but there is no central `test` script for the backend by default.
- Quick guidance:
  - Backend: tests (if added) can be run from `backend` with a `test` script (e.g., using `jest` or `mocha`). Current `backend/package.json` has a placeholder `test` script.
  - Frontend: Vite + React tests would typically use `vitest` or `jest` — this project includes some React test files under `civiceye-project/src/__tests__`.

If you want, I can add working test scripts and an example CI job next.

## Useful tips
- Ensure `uploads/` exists at repository root for multipart uploads.
- If you run into map/Leaflet issues, confirm `public/libs/leaflet` files are present for the frontend.

## Troubleshooting
- Server logs are printed to console by `backend/index.js`. Look for request logging and errors there.
- If ports conflict, change Vite or backend port in scripts.

---
Generated on April 1, 2026.
