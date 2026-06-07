# AGENTS.md

Guidance for humans and AI agents working in **Be Disciplined**. This repo was
scaffolded by `create-zachstack-app`; the structure below is intentional — follow
it when adding features.

## Monorepo layout

```
be-disciplined/
├─ client/   # Expo (React Native) app
├─ server/   # Express API
└─ package.json   # root scripts (uses `concurrently`, no workspace hoisting)
```

Each app keeps its **own `node_modules`** (no hoisting) so Expo/Metro resolution
stays predictable. Always install with `npm run install:all` or inside the
individual app directory.

## Commands

| Command                          | Where  | Purpose                          |
| -------------------------------- | ------ | -------------------------------- |
| `npm run dev`                    | root   | server + client together         |
| `npm --prefix server run dev`    | root   | server only (`tsx watch`)        |
| `npm --prefix server run db:generate` | root | generate a Drizzle migration  |
| `npm --prefix server run db:migrate`  | root | apply migrations              |
| `npm --prefix server run db:push`     | root | push schema (dev convenience) |
| `npm --prefix client run dev`    | root   | Expo dev server                  |

## Server conventions (`server/src`)

- **Entry point:** `index.ts` — wires Express, Socket.IO, the Better Auth handler
  (`/api/auth/*`), rate limiting, routes, and calls `initCronJobs()` on boot.
- **Routes:** add a `Router` in `routes/<name>.ts`, then register it in
  `routes/index.ts`. Protect endpoints with `authMiddleware` from
  `utils/middleware.ts` — it sets `res.locals.userId` (typed via `express.d.ts`).
- **Database:** Drizzle schema in `db/schema.ts`, relations in `db/relations.ts`.
  The starter ships only the Better Auth tables (`user`, `session`, `account`,
  `verification`) plus a `user.expoPushToken` column. Add your tables here and run
  `db:generate` + `db:migrate`.
- **Auth:** `utils/auth.ts`. Email OTP is delivered through Resend. Add fields with
  Better Auth `user.additionalFields` (and mirror them in the client's
  `inferAdditionalFields`).
- **Background jobs (BullMQ):**
  - Define a queue in `queues/<name>Queue.ts` (shared Redis connection from
    `queues/index.ts`).
  - Define its worker in `workers/<name>Worker.ts` and add it to the array in
    `workers/closeWorkers.ts` for graceful shutdown.
  - A generic **push-notification** queue/worker is included as a working example.
- **Cron jobs:** register repeatable jobs inside `initCronJobs()` in
  `db/cronJobs.ts`. The `cronJobsList` array is intentionally empty — drop your
  init functions in.
- **Real-time invalidation:** call `invalidateQueries`, `invalidateQueriesForUser`,
  or `invalidateQueriesForUsers` (from `utils/invalidateQueries.ts`) with a TanStack
  Query key. The client's `InvalidationProvider` receives it over Socket.IO and
  refetches.
- **Storage:** `utils/r2.ts` exposes the S3 client + `uploadToR2()` helper. Use the
  `upload` multer middleware from `utils/middleware.ts` for multipart uploads.
- **Other utils:** `logger.ts`, `cache.ts` (generic `cached()` helper), `redis.ts`,
  `limiter.ts`, `handleError.ts`, `pushNotifications.ts`.

## Client conventions (`client/`)

- **Routing:** Expo Router under `app/`. `app/_layout.tsx` holds all providers and
  the `RootNavigator`, which uses `authClient.useSession()` to switch between the
  `auth` screen and the `(protected)` group via `Stack.Protected`.
- **Protected area:** `app/(protected)/_layout.tsx` is the tab navigator. The
  starter has a single **Home** tab (`app/(protected)/(home)`). Add tabs here.
- **Auth:** `lib/auth-client.ts` (Better Auth Expo client, email OTP). The
  `app/auth.tsx` screen implements the two-step email → OTP flow.
- **Data fetching:** TanStack Query. API calls go through `serverRequest()` in
  `lib/endpoints.ts` (forwards the Better Auth session cookie). Invalidation is
  automatic via `components/providers/InvalidationProvider.tsx`.
- **UI:** React Native Reusables components in `components/ui/` using the **default**
  NativeWind theme (`global.css` / `tailwind.config.js`). Icons via
  `components/ui/icon.tsx` + `lucide-react-native`. Toasts via `sonner-native`.
- **Push notifications:** `hooks/usePushNotifications.ts` registers the Expo push
  token (sent to `PATCH /users/expo-push-token`). Requires an EAS `projectId` in
  `app.json` and a physical device.

## Environment

Two `.env` files, both created with empty values — fill them before running:

- `server/.env`: `PORT`, `NODE_ENV`, `DATABASE_URL`, `REDIS_*`, `R2_*`,
  `RESEND_API_KEY`, `RESEND_FROM_OTP_DNS`, `LOGGER_LEVEL`.
- `client/.env`: `EXPO_PUBLIC_SERVER_URL`.

Never commit real secrets — `.env` is gitignored.
