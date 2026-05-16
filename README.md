# Team Task Manager

A full-stack project and task management app with role-based admin/member access, project invitations, team views, assigned tasks, and a Kanban-style task board.

## Features

- Authentication with JWT and bcrypt.
- Admin/member role split.
- Admin dashboard for member and role management.
- Member dashboard for allocated projects, tasks, team, and invitations.
- Project creation, project invitations, and project member access.
- Task creation, assignment, status updates, and dashboard stats.
- Light professional UI built with React, Vite, Tailwind CSS, Lucide React, Framer Motion, and Chart.js.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS.
- Backend: Node.js, Express.js.
- Database: SQLite with Sequelize.
- Auth: JWT and bcryptjs.

## Local Setup

### Server

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

For local development, use `DB_STORAGE=./database.sqlite` in `server/.env`.

### Client

```bash
cd client
npm install
npm run dev
```

Optional client variables:

```txt
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## Railway Deployment

Deploy this repository as two Railway services from the same GitHub repo.

### Backend Service

- Root Directory: `/server`
- Start Command: `npm start`
- Variables:

```txt
PORT=5000
NODE_ENV=production
DB_STORAGE=/data/database.sqlite
JWT_SECRET=replace_with_a_long_random_secret
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Add a Railway volume mounted at `/data` so the SQLite database persists across deploys.

### Frontend Service

- Root Directory: `/client`
- Build Command: `npm run build`
- Start Command: `npm start`
- Variables:

```txt
VITE_API_URL=https://YOUR-BACKEND-RAILWAY-DOMAIN.up.railway.app/api
```

Deploy the backend first, copy its public Railway URL, then set `VITE_API_URL` on the frontend service.
