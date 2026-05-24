# Ticketing System

Full-stack ticketing system — Spring Boot backend + Next.js frontend + Railway PostgreSQL.

## Stack
| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend  | Spring Boot 3.2, Java 17, Spring Security, JPA |
| Auth     | JWT + BCrypt |
| Database | PostgreSQL (Railway) |
| Deploy   | Railway (backend + DB) + Vercel (frontend) |

## Default seeded users
| Email | Password | Role |
|-------|----------|------|
| admin@example.com | Admin@123 | ADMIN |
| agent@example.com | Agent@123 | AGENT |
| user@example.com  | User@123  | USER  |

---

## Deploy: Railway (Backend + Database)

### Step 1 — Add PostgreSQL to Railway
Railway Dashboard → New Project → **"Add PostgreSQL"**
Railway will create a Postgres service and auto-set `DATABASE_URL`.

### Step 2 — Add Backend Service
In same project → **"Add Service" → "GitHub Repo"** → select your repo
Railway auto-detects the `Dockerfile` at project root.

### Step 3 — Add these Variables to the backend service
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | *(copy from Railway PostgreSQL service → Variables → DATABASE_URL)* |
| `DATABASE_USERNAME` | *(from Railway PostgreSQL → PGUSER)* |
| `DATABASE_PASSWORD` | *(from Railway PostgreSQL → PGPASSWORD)* |
| `JWT_SECRET` | `8cB3qv7tR2mK9yL4sG6nT1wV5hQ0zX3eN8pD2fJ7uA9cM4rS6xY1kP7bH3vQ5tZ` |
| `FRONTEND_URL` | `https://your-app.vercel.app` *(update after Vercel deploy)* |

### Step 4 — Get backend URL
Settings → Domains → copy URL like `https://ticketing-backend.up.railway.app`

---

## Deploy: Vercel (Frontend)

### Step 1 — Import repo on Vercel
New Project → Import `your-repo` → **Root Directory = `frontend`**

### Step 2 — Add Environment Variable
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://ticketing-backend.up.railway.app` |

### Step 3 — Deploy
After deploy, copy Vercel URL and update `FRONTEND_URL` in Railway backend variables.

---

## Local Development

```bash
# Start backend
cd backend
export DATABASE_URL=jdbc:postgresql://localhost:5432/ticketing
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=postgres
export JWT_SECRET=8cB3qv7tR2mK9yL4sG6nT1wV5hQ0zX3eN8pD2fJ7uA9cM4rS6xY1kP7bH3vQ5tZ
mvn spring-boot:run
# → http://localhost:8080

# Start frontend (new terminal)
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
npm install && npm run dev
# → http://localhost:3000
```
