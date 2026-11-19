# Blockbox (Final Exam): Express + MariaDB + React

Three parts, one shared `JWT_SECRET`:

| Part | Port | Job |
|---|---|---|
| `auth-server` | 4000 | Registers users, issues access (15 min) and refresh (7 days) JWTs, stores refresh-token **hashes** in MariaDB |
| `blog-server` | 5000 | Verifies tokens locally with the same secret (never calls the Auth Server), CRUD for posts in MariaDB |
| `frontend` | 5173 | React (Vite) app. Its dev server proxies `/auth/*` to 4000 and `/api/*` to 5000 |

## 1. Database (XAMPP)
1. Open the XAMPP Control Panel and **Start** Apache and MySQL (MariaDB).
2. Open http://localhost/phpmyadmin → **Import** → choose `database/schema.sql` → Go.
   (Or run `npm run db:init`. Both drop and recreate the tables.)
3. Optional demo data: `npm run db:seed` adds users `admin`, `alice`, `bob` (author) and `reader`, all with password `Password123!`, plus 4 posts.

## 2. Run
```bash
npm install                 # backend packages (project root)
cp .env.example .env        # Windows: copy .env.example .env   then set JWT_SECRET
npm run auth                # terminal 1  -> http://localhost:4000
npm run blog                # terminal 2  -> http://localhost:5000
cd frontend && npm install && npm run dev    # terminal 3 -> http://localhost:5173
npm test                    # optional: 57-check API smoke test (servers must be running)
```
`.env` defaults match XAMPP: `DB_USER=root`, empty `DB_PASSWORD`, `DB_NAME=blog_platform`. Change them if your MariaDB differs.

## Database design (`database/schema.sql`)
```
roles (id PK, role UNIQUE, created_at, updated_at, encoder_id)
  └─1:N─ users (id PK, email UNIQUE, username UNIQUE, password_hash, role_id FK, is_active, created_at, updated_at)
            ├─1:N─ refresh_tokens (id PK, user_id FK, token_hash CHAR(64) UNIQUE, expires_at, revoked_at, created_at)
            └─1:N─ posts (id PK, author_id FK, title, content TEXT, created_at, updated_at)
```
`roles.id` and `users.role_id` are both signed `INT` so the foreign key is compatible. Roles `reader`, `author`, `admin` are inserted by the schema script. Deleting a user cascades to their posts and tokens.

## API (unchanged from the midterm, plus `email` on register)
**Auth Server (4000)**: `POST /register` `{username,email,password,role}` (201/400/409), `POST /login` (200/400/401), `POST /refresh` (200/400/401), `POST /logout` (200/400)

**Blog Server (5000)**

| Method | Path | Access |
|---|---|---|
| GET | `/api/posts` | public |
| GET | `/api/posts/:id` | public |
| POST | `/api/posts` | author, admin |
| PUT | `/api/posts/:id` | post owner or admin |
| DELETE | `/api/posts/:id` | admin |
| GET | `/api/me/posts` | any logged-in user |

Send `Authorization: Bearer <accessToken>`. Every error is `{ "error": "message" }`.

## How it works
- **Tokens**: access = `{ id, username, role }`; refresh = `{ id, username, type: "refresh", jti }`. Same secret, HS256. `authenticate` rejects `type: "refresh"`.
- **Refresh tokens in the database**: on login only the SHA-256 hash is stored in `refresh_tokens` (one row per login, so several devices work). `/refresh` verifies the JWT, checks `type`, then requires a matching row that is not revoked and not expired. `/logout` stamps `revoked_at`.
- **Postman vs browser**: the refresh token is returned in the JSON body (Postman) and also set as an **httpOnly cookie** (`cookie-parser`). `/refresh` and `/logout` accept either, so the React app never touches the refresh token in JavaScript.
- **React app**: the access token is kept in memory only. A 401 triggers one silent `/auth/refresh` and a retry. On page load the session is restored from the cookie. UI buttons follow the role, but the servers enforce the real rules.
- **Passwords**: `crypto.scrypt` with a per-user random salt, compared with `timingSafeEqual`.
- **Packages from the schema note**: `mysql2` (pool in each `db.js`), `helmet` (security headers), `express-rate-limit` (login/register limited per IP; the Blog Server has a general limit), `cookie-parser`.

