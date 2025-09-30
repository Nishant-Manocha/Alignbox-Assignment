# ChatSphere

Real-time group chat built with Node.js, Express, Socket.IO, and PostgreSQL.


## Structure
- `server.js` – Node/Express server, Socket.IO, PostgreSQL init
- `public/` – Frontend
  - `public/index.html` – UI
  - `public/app.js` – client logic (Socket.IO)
  - `public/style.css` – styles
- `package.json` – dependencies
- `.env` – environment variables (you create this)

## Prerequisites
- Node.js 18+ and npm
- PostgreSQL (local or hosted)

## 1) Install dependencies
```bash
npm install
```

## 2) Configure PostgreSQL
Choose Local or Hosted.

### Local PostgreSQL
Open psql as superuser (e.g., `postgres`) and run:
```sql
CREATE DATABASE chatproject;
CREATE USER myuser WITH PASSWORD 'Nnishant';
GRANT ALL PRIVILEGES ON DATABASE chatproject TO myuser;
\c chatproject
ALTER SCHEMA public OWNER TO myuser;
GRANT USAGE, CREATE ON SCHEMA public TO myuser;
```

### Hosted PostgreSQL (Render, Neon, Railway, Supabase)
- Create a database in the provider dashboard
- Copy the full connection string (often includes `?sslmode=require`)
- Ensure your DB user can CREATE in schema `public`

## 3) Environment variables
Create a `.env` file in the project root with:
```
DATABASE_URL=postgresql://myuser:Nnishant@localhost:5432/chatproject
# If using hosted PG that requires SSL:
# PGSSLMODE=require
```
Notes:
- No quotes around the URL
- URL-encode special characters in passwords (e.g., @ → %40)

## 4) Run locally
```bash
node server.js
```
Open `http://localhost:5000/`.

Verify env if needed:
```bash
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

## What the server does
- Serves static files from `public/`
- Auto-creates table `messages` on first run:
  - `id SERIAL PRIMARY KEY`
  - `username VARCHAR(255)`
  - `message TEXT`
  - `is_anonymous BOOLEAN DEFAULT false`
  - `timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  - `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- Socket.IO provides real-time chat and user count

## Troubleshooting
- "client password must be a string": `.env` missing/incorrect. Ensure the printed URL is correct.
- Permission denied for schema public:
```sql
\c chatproject
ALTER SCHEMA public OWNER TO myuser;
GRANT USAGE, CREATE ON SCHEMA public TO myuser;
```
- Join button does nothing: make sure you open via `http://localhost:5000/` (not the HTML file directly) so `/socket.io/socket.io.js` loads.

## Deploy (easiest: Render)
1) Push this repository to GitHub
2) In Render → New → Web Service → connect repo
3) Build: `npm install` | Start: `node server.js`
4) Create a Render PostgreSQL (or use Neon/Railway) and copy the connection URL
5) In Render service → Environment:
   - `DATABASE_URL` = your connection string
   - If required: `PGSSLMODE` = `require`
6) Deploy → open the Render URL

## Deploy (Railway)
1) Deploy repo on Railway
2) Add PostgreSQL plugin
3) Set `DATABASE_URL` to plugin connection URL
4) If required: `PGSSLMODE=require`
5) Deploy and open URL

## Change port (optional)
```powershell
set PORT=8080 && node server.js
```
Open `http://localhost:8080/`.

## License
ISC

