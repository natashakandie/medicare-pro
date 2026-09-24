# MediCore Pro

A hospital management system with real authentication, role-based access
control, and a MySQL/MariaDB-backed Express + EJS backend. See
[`hospital-management-system/README.md`](hospital-management-system/README.md)
for full setup, demo accounts, and role permissions.

## Quick start

```bash
npm install
cp hospital-management-system/.env.example hospital-management-system/.env
# edit hospital-management-system/.env with your MySQL credentials and a random SESSION_SECRET
npm run db:setup
npm run dev
```

Open `http://localhost:3000` and sign in with `admin@medicore.pro` / `Admin@123`
(more demo accounts in the sub-project README).

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Run the server |
| `npm run dev` | Run the server with auto-restart (nodemon) |
| `npm run db:setup` | Create/upgrade the database and seed demo data (safe to re-run) |
| `npm run db:healthcheck` | Check the database connection without starting the server |
