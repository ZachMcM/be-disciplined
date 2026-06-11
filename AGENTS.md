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

## Installing React Native Reusables (RNR) components

RNR ships components as source files — copy them into `client/components/ui/` rather
than installing a package. To add a new primitive (e.g. `checkbox`):

```bash
# from the repo root
npx --prefix client shadcn@latest add checkbox
```

Run this inside the `client/` directory (or use `--prefix client` from root). After
copying, commit the new file in `components/ui/`. Document any new primitives added to
`AGENTS.md` so future agents know what is available.

Currently available RNR components in `components/ui/`:
`avatar`, `aspect-ratio`, `button`, `card`, `icon`, `input`, `label`, `separator`,
`skeleton`, `text`

## Installing Expo modules

**Always install Expo modules with `npx expo install <package>`, never plain
`npm install`.** `expo install` resolves the version that matches the project's
Expo SDK and wires up the native module so Metro can resolve it. Plain
`npm install` pulls an incompatible version and leaves the native side
unregistered, which surfaces at runtime as errors like:

```
Requiring unknown module "4197". If you are sure the module exists, try
restarting Metro. You may also want to run `yarn` or `npm install`.
```

Run it inside `client/` (or `npx --prefix client expo install <package>` from
root). Examples that bit us:

- `npx expo install expo-image-picker` — required before importing
  `expo-image-picker`, otherwise the module fails to resolve at runtime.
- `npx expo install expo-network` — a transitive dependency of Better Auth's
  Expo client; without it the auth flow errored until installed (this is also
  why the `@better-auth/expo` patch in `patches/` exists — keep both).

## Server conventions (`server/src`)

- **Entry point:** `index.ts` — wires Express, Socket.IO, the Better Auth handler
  (`/api/auth/*`), rate limiting, routes, and calls `initCronJobs()` on boot.
- **Routes:** add a `Router` in `routes/<name>.ts`, then register it in
  `routes/index.ts`. Protect endpoints with `authMiddleware` from
  `utils/middleware.ts` — it sets `res.locals.userId` (typed via `express.d.ts`).
- **Request validation:** every route that accepts a body **must** define a Zod schema
  and call `.safeParse(req.body)`. Return `400` with `{ error: parsed.error.message }`
  on failure. Never trust `req.body` without parsing. Example pattern:
  ```ts
  const CreateFooSchema = z.object({ name: z.string().min(1) });
  const parsed = CreateFooSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  ```
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
  refetches. See the **Optimistic-update + server broadcast pattern** section below
  for the required client-side pattern that pairs with these server broadcasts.
- **Storage:** `utils/r2.ts` exposes the S3 client + `uploadToR2()` helper. Use the
  `upload` multer middleware from `utils/middleware.ts` for multipart uploads.
- **Other utils:** `logger.ts`, `cache.ts` (generic `cached()` helper), `redis.ts`,
  `limiter.ts`, `handleError.ts`, `pushNotifications.ts`.

## Optimistic-update + server broadcast pattern

When a mutation changes a resource on the server, follow this split pattern:

**Server side** (in the route handler):
1. Perform the DB write and return the new/updated resource in the response body.
2. Call `invalidateQueriesForUser(otherUserId, queryKey)` for every _other_ affected
   user so their clients refetch automatically.
3. Do **not** invalidate the requesting user — they update locally (see below).

**Client side** (in the `useMutation` `onSuccess` callback):
1. Call `queryClient.cancelQueries({ queryKey })` to cancel any in-flight refetch.
2. Call `queryClient.setQueryData(queryKey, updater)` to manually apply the returned
   resource — e.g. append the new item, remove the deleted item, update in place.
3. Never call `queryClient.invalidateQueries` for the requesting user's own key on
   success; the server broadcast handles all other users.

Example (accepting a friend request):
```ts
const acceptMutation = useMutation({
  mutationFn: acceptFriendRequest,
  onSuccess: (newFriend) => {
    queryClient.cancelQueries({ queryKey: ['friends'] });
    queryClient.setQueryData<FriendsData>(['friends'], (old) => {
      if (!old) return old;
      return {
        ...old,
        friends: [...old.friends, newFriend],
        requestsReceived: old.requestsReceived.filter((r) => r.id !== newFriend.id),
      };
    });
  },
});
```

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
