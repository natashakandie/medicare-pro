# Deploying MediCore Pro on cPanel

This app is Node.js + Express, so it needs a cPanel plan with **Node.js
Selector** (also called "Setup Node.js App"). If that icon isn't in your
cPanel, ask your host to enable CloudLinux NodeJS Selector, or use a
Node-friendly host (a VPS, Render, Railway, etc.) instead — plain PHP-only
shared hosting cannot run this app.

## 1. Get the code onto the server

Easiest: cPanel's **Git Version Control** feature.

1. cPanel → **Git™ Version Control** → **Create**.
2. Clone URL: `https://github.com/natashakandie/medicare-pro.git`
3. Repository path: something outside `public_html`, e.g. `medicare-pro`
   (Node apps should not live inside the public web root).
4. Deploy the branch you want live.

No Git access? Zip the project locally (exclude `node_modules`, `.git`, `.env`)
and upload/extract it via **File Manager** into the same kind of folder.

## 2. Create the database

cPanel MySQL users can't run `CREATE DATABASE` from SQL — create it through
the UI so it gets the correct account prefix and grants:

1. cPanel → **MySQL® Databases** → create a database, e.g. `medicore`
   (cPanel will name it something like `cpaneluser_medicore`).
2. Create a database user with a strong password.
3. Add that user to the database with **ALL PRIVILEGES**.
4. Note the full, prefixed database name and username — you'll need both.

## 3. Import the schema (and your data)

1. cPanel → **phpMyAdmin** → select the database you just created.
2. **Import** tab → choose `hospital-management-system/database/hospital_management_system.sql`
   → **Go**.
   - This file has no `CREATE DATABASE`/`USE` statements by design, so it
     imports straight into whichever database is selected.
   - It's safe to re-run: existing rows are never duplicated.
   - This gives you the demo seed data (patients, doctors, appointments, the
     six login accounts) as a starting point.

**To bring over real data from your local machine instead of the demo seed**,
export your local database first and import that dump instead:

```bash
# on your local machine, with the DB running
mysqldump -u root -p hospital_management_system > medicore-data.sql
```

Then Import `medicore-data.sql` in phpMyAdmin the same way. Either import
gives you a fully working database — pick the seed data or your real dump,
not both.

## 4. Configure the Node.js app

cPanel → **Setup Node.js App** → **Create Application**:

| Field | Value |
|---|---|
| Node.js version | 18 or newer |
| Application mode | Production |
| Application root | the folder you cloned/uploaded to, e.g. `medicare-pro` |
| Application URL | your domain or subdomain |
| Application startup file | `hospital-management-system/server.js` |

After creating it, add **Environment Variables** in the same screen (this is
safer than uploading a `.env` file, and cPanel-set variables automatically
take precedence over anything in `.env`):

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | a long random string — generate one below |
| `DB_HOST` | `localhost` |
| `DB_PORT` | `3306` |
| `DB_USER` | the prefixed DB user from step 2 |
| `DB_PASSWORD` | that user's password |
| `DB_NAME` | the prefixed DB name from step 2 |

Generate a secret locally:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Do **not** set `PORT` — cPanel/Passenger assigns that automatically and the
app already reads `process.env.PORT`.

Then click **Run NPM Install** in the same screen (installs dependencies
inside cPanel's managed virtual environment — no SSH needed), and **Restart**.

## 5. Enable HTTPS

The app marks its session cookie `secure` whenever `NODE_ENV=production`,
which means the login cookie only works over HTTPS. Turn on **AutoSSL** for
the domain in cPanel (usually free) before you rely on this in production —
otherwise logins will silently fail to persist.

## 6. Verify

Visit `https://yourdomain.com/health` — it should return
`{"ok":true,"message":"Connected to ... "}`. Then visit the site itself and
sign in with `admin@medicore.pro` / `Admin@123` (change this password from
Settings once you're in, or update the seed data before going live).

## Updating later

- **Code changes**: pull the latest commit (Git Version Control → Manage →
  Pull), then **Restart** the app from Setup Node.js App.
- **Schema changes**: re-import `hospital_management_system.sql` via
  phpMyAdmin — it only adds what's missing, so existing data is untouched.
