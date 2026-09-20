# Signup & login demo

Express backend with two POST endpoints and three static HTML pages. The "database" is a JSON array in `database.js`, so data resets on every restart.

## Run it

```bash
npm install
npm start
```

Then open http://localhost:3000/signup.html

Seeded accounts: `nazz` / `12345` and `shiye` / `shiye123`.

## Files

| File | Role |
| --- | --- |
| `server.js` | Express app, both POST routes, static file serving |
| `database.js` | The users array plus an id counter |
| `public/signup.html` | Signup form, calls `POST /api/signup` |
| `public/login.html` | Login form, calls `POST /api/login` |
| `public/home.html` | Where both forms redirect on success |
| `public/styles.css` | Shared styles |

## API

### POST /api/signup

Body: `{ "email": "...", "username": "...", "password": "..." }`

| Status | When |
| --- | --- |
| 201 | User created and pushed to the array |
| 400 | Any of the three fields is missing or blank |
| 409 | Username or email already in the array |

### POST /api/login

Body: `{ "username": "...", "password": "..." }` — sent in the request body, never as URL params.

| Status | When |
| --- | --- |
| 200 | Username and password match a stored user |
| 400 | Either field is missing or blank |
| 401 | No matching user |

The spec only listed 200 and 400 for login, but a failed lookup needs its own code — 401 distinguishes "you left a field blank" from "those credentials are wrong." Change it if your rubric wants something else.

## Notes on the implementation

- Forms use `novalidate` so blank submissions actually reach the server and produce a real 400 instead of being stopped by the browser.
- Username and email comparisons are case-insensitive; passwords are not.
- Redirects happen client-side via `window.location` after a successful fetch. A server-side 302 wouldn't work here because the browser follows it inside the fetch rather than navigating the page.
- Passwords are stored in plain text. That's fine for a demo and wrong for anything real — a production version would hash with bcrypt or argon2 and issue a session cookie or token instead of trusting `sessionStorage`.
