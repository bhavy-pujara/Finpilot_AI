# FinPilot AI — Production Deployment & Cloud Infrastructure Guide

This guide details deployment options for FinPilot AI across local Docker Compose, cloud container hosting (AWS ECS, Google Cloud Run, Railway, or Render), Neon PostgreSQL, and Vercel.

---

## 1. Environment Configuration Matrix

All configuration is driven by standard environment variables (see `.env.example`):

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PROJECT_NAME` | Application identification | `FinPilot AI` |
| `ENVIRONMENT` | Deployment environment | `production` or `development` |
| `SECRET_KEY` | Cryptographic secret for JWT signing | `Generate with: openssl rand -hex 32` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Session validity duration | `1440` (24 hours) |
| `DATABASE_URL` | PostgreSQL or SQLite connection string | `postgresql://user:pass@ep-xyz.neon.tech/finpilot?sslmode=require` |
| `REDIS_ENABLED` | Toggle background task queue | `true` |
| `REDIS_URL` | Redis cache connection string | `redis://localhost:6379/0` |
| `DEFAULT_LLM_PROVIDER` | AI provider (`gemini` or `fallback`) | `fallback` (offline) or `gemini` |
| `GEMINI_API_KEY` | Google Gemini API Key | Optional (defaults to deterministic fallback) |
| `NEXT_PUBLIC_API_URL` | Frontend API reverse proxy endpoint | `http://localhost:8000/api/v1` |

---

## 2. Docker Compose Deployment (Local & Single-Server)

The project includes a multi-service `docker-compose.yml` for unified local or VPS deployment:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: finpilot-postgres
    restart: always
    environment:
      POSTGRES_USER: finpilot
      POSTGRES_PASSWORD: finpilotpassword
      POSTGRES_DB: finpilot
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    container_name: finpilot-redis
    restart: always
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: finpilot-backend
    restart: always
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://finpilot:finpilotpassword@db:5432/finpilot
      REDIS_URL: redis://redis:6379/0
      ENVIRONMENT: production
    depends_on:
      - db
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: finpilot-frontend
    restart: always
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Starting Docker Compose
```bash
docker-compose up --build -d
```
Verify running containers:
```bash
docker-compose ps
```

---

## 3. Cloud Database Configuration: Neon PostgreSQL

1. Log into [Neon.tech](https://neon.tech) and create a new project named `finpilot-prod`.
2. Copy the pooled PostgreSQL connection string:
   ```text
   postgresql://[user]:[password]@[endpoint-pooler].neon.tech/finpilot?sslmode=require
   ```
3. Update your backend environment:
   ```bash
   DATABASE_URL="postgresql://[user]:[password]@[endpoint-pooler].neon.tech/finpilot?sslmode=require"
   ```
4. Run Alembic migrations:
   ```bash
   cd backend
   alembic upgrade head
   python -m app.core.seed
   ```

---

## 4. Frontend Deployment: Vercel

1. Push your code to a GitHub repository.
2. Link the repository on [Vercel](https://vercel.com).
3. Set the Root Directory to `frontend`.
4. Add the Environment Variable:
   ```text
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
   ```
5. Deploy. Vercel automatically runs `next build` and serves the optimized Next.js 14 SSR/SSG application on the edge.

---

## 5. Backend Deployment: Cloud Run / Render / AWS ECS

The `backend/Dockerfile` produces a production-hardened container running Uvicorn with Gunicorn process management:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Health check endpoint for container orchestrators:  
`GET /api/v1/admin/health` returns HTTP 200 with `{ "status": "HEALTHY" }`.

---

## 6. Security & Production Checklist

- [ ] Rotate `SECRET_KEY` to a 64-character random hexadecimal string.
- [ ] Configure `ALLOWED_ORIGINS` in FastAPI CORS middleware to allow only your production frontend domain.
- [ ] Enable SSL/TLS termination with valid HTTPS certificates (Let's Encrypt / Cloudflare).
- [ ] Confirm Neon PostgreSQL connection pooling is enabled with `sslmode=require`.
- [ ] Restrict Admin route access (`/api/v1/admin/*`) via RBAC roles.
- [ ] Verify that real broker trading API keys are rejected and simulation safe harbors remain enforced.
