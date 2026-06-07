# Be Disciplined

A full-stack mobile app monorepo scaffolded with
[`create-zachstack-app`](https://github.com/ZachMcM/create-zachstack-app).

- **`client/`** — React Native (Expo) app: Expo Router, Better Auth (email OTP),
  NativeWind + React Native Reusables, TanStack Query with real-time invalidation.
- **`server/`** — Express API: Better Auth, Drizzle ORM (Postgres), BullMQ + Redis
  jobs, Socket.IO invalidation, Cloudflare R2 storage, Expo push notifications.

## Getting started

```bash
# 1. Install dependencies for both apps
npm run install:all

# 2. Configure environment variables
#    - server/.env  (database, redis, r2, resend…)
#    - client/.env  (EXPO_PUBLIC_SERVER_URL)

# 3. Set up the database (creates the Better Auth tables)
npm --prefix server run db:push

# 4. Run server + client together
npm run dev
```

You'll need a **PostgreSQL** database, a **Redis** instance, a
[**Resend**](https://resend.com) API key (for sending OTP emails), and optionally a
[**Cloudflare R2**](https://developers.cloudflare.com/r2/) bucket for file uploads.

## Scripts

| Command                 | What it does                                      |
| ----------------------- | ------------------------------------------------- |
| `npm run dev`           | Run the server and client concurrently            |
| `npm run dev:server`    | Run only the server (`tsx` watch)                 |
| `npm run dev:client`    | Run only the Expo client                          |
| `npm run install:all`   | Install dependencies in `server/` and `client/`   |
| `npm run build:server`  | Type-check + compile the server to `server/dist`  |

## Project layout

See [`AGENTS.md`](./AGENTS.md) for a map of the codebase and conventions — where
routes, queues, cron jobs, schema and the auth/invalidation flow live.

---

Generated with [create-zachstack-app](https://github.com/ZachMcM/create-zachstack-app) by Zach McMullen.
