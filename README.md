# Property Listings

A full-stack property listing platform: Rails 8 API + Next.js frontend + PostgreSQL, orchestrated with Compose and ready for nginx on a VPS.

Browse and manage listings through a modern i18n-aware web UI backed by a JWT-authenticated API (Devise + devise-jwt), with a Postman collection included for API exploration.

## Who it's for

- Real-estate teams that need a listings site with a real API
- Agencies wanting a container-ready stack they can drop on a VPS
- Devs building property CRUD, auth, and multilingual frontends

## What you get

- **Backend:** Rails 8 API, PostgreSQL, Devise JWT auth, pagination, serializers
- **Frontend:** Next.js app with internationalization (`i18n` / `messages`)
- **Ops:** `docker-compose.yml`, Dockerfiles, nginx example config, `.env.example`
- **API tooling:** Postman collection at the repo root
- Deployment walkthrough in `DEPLOYMENT-SUMMARY.md`

## Try it

**Containers (recommended):** copy `.env.example` to `.env`, put in your own secrets (do not commit real keys), then build and start with Compose from the repo root.

Typical layout from the deployment docs:

- Frontend container → host port **3001**
- Backend API container → host port **3000**
- PostgreSQL in its own service

Point host nginx at those ports using `nginx-config-example.conf` when you go live.

**Frontend only:** under `frontend/`, sync deps and run the `dev` script.

**Backend only:** use the Rails app under `backend/` with Postgres and env vars from `.env.example` (generate fresh secrets for production).

## Stack

Rails 8 · PostgreSQL · Devise JWT · Next.js · TypeScript · Compose · Nginx

## Notes

Root `README.md` is the product overview. Extra deployment detail lives in `DEPLOYMENT-SUMMARY.md`. Keep secrets out of git — treat `.env.example` as a template only.

---

[MaVoid](https://mavoid.com) · [LinkedIn](https://linkedin.com/in/ziad-ahmed-634202332) · [GitHub](https://github.com/Ziad-NasrEldin)
