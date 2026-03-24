# Diwali Ball

Frontend app (Vite + React) with a lightweight Node/Express backend for pre-assigned attendee login and ticket data.

## Backend setup (Neon PostgreSQL)

1. Create `.env` in the project root from `.env.example`.
2. Add your Neon connection string to `DATABASE_URL`.
3. Set a strong `JWT_SECRET`.

Example:

```
DATABASE_URL=postgresql://...
JWT_SECRET=some-long-random-secret
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

## Database commands

Run migrations:

```
npm run db:migrate
```

Seed attendees from `src/data/attendees.json`:

```
npm run db:seed
```

## Run app + API

Frontend:

```
npm run dev
```

Backend:

```
npm run dev:api
```

## API endpoints

- `GET /api/health` - health + DB connectivity check
- `POST /api/auth/login` - login with `{ username, password }`, returns `{ token, user }`
- `GET /api/auth/me` - get current user from `Authorization: Bearer <token>`
- `GET /api/tickets/verify?token=...` - verify ticket token, returns `valid`, `checked-in`, or `invalid`
