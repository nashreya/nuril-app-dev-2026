# Blog Platform (Midterm Exam)

Two Express servers sharing one `JWT_SECRET`:

| Server | Port | Job |
|---|---|---|
| `auth-server` | 4000 | Registers users, issues access (15 min) and refresh (7 days) JWTs |
| `blog-api` | 5000 | Verifies tokens locally with the same secret; never calls the Auth Server |

## Run
```bash
npm install
cp .env.example .env      # then set JWT_SECRET to a long random string
npm run auth              # terminal 1 -> http://localhost:4000
npm run blog              # terminal 2 -> http://localhost:5000
npm test                  # terminal 3 -> smoke test of every endpoint (49 checks)
```

## Endpoints
**Auth Server (4000)**: `POST /register` (201/400/409), `POST /login` (200/400/401), `POST /refresh` (200/400/401), `POST /logout` (200/400)

**Blog API (5000)**

| Method | Path | Access |
|---|---|---|
| GET | `/api/posts` | public |
| GET | `/api/posts/:id` | public |
| POST | `/api/posts` | author, admin |
| PUT | `/api/posts/:id` | post owner or admin |
| DELETE | `/api/posts/:id` | admin |
| GET | `/api/me/posts` | any logged-in user |

Send `Authorization: Bearer <accessToken>`. All errors look like `{ "error": "message" }`.

## Design notes
- **Tokens**: access = `{ id, username, role }`; refresh = `{ id, username, type: "refresh", jti }`. Same secret, HS256. `authenticate` rejects anything with `type: "refresh"`.
- **Refresh flow**: `/refresh` verifies the JWT, checks `type === "refresh"`, and requires an exact match with the user's stored `refresh_token`. Login stores it and clears `revoked_at`; logout clears it and sets `revoked_at`. Each user holds one refresh token, so a new login invalidates the previous session.
- **Passwords**: `crypto.scrypt` with a random per-user salt, compared with `timingSafeEqual`.
- **Persistence**: Node has no browser `localStorage`, so each server has `src/utils/localStorage.js`, a file-backed version of the same API (`data/localStorage.json`, git-ignored). Arrays load from it at startup and save after every change.
- **Post shape**: `{ id, authorId, title, content, created_at, updated_at }`.
- **PUT order of checks**: 404 (no such post), then 403 (not owner/admin), then 400 (bad body).

## Submitting
```bash
git checkout -b midterm-exam
git add . && git commit -m "Midterm exam: blog platform"
git push -u origin midterm-exam
```
