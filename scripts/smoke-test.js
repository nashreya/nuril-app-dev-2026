// Run with both servers up:  npm run auth  |  npm run blog  |  npm test
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const AUTH = `http://localhost:${process.env.AUTH_PORT || 4000}`;
const BLOG = `http://localhost:${process.env.BLOG_PORT || 5000}`;
let pass = 0, fail = 0;

async function call(base, method, path, { body, token } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}
function check(name, cond) {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
}

(async () => {
  const s = Date.now().toString(36);
  const u = (r) => `${r}_${s}`;
  const pw = "Secret123!";

  // --- Auth server
  for (const r of ["reader", "author", "admin"]) {
    const x = await call(AUTH, "POST", "/register", { body: { username: u(r), password: pw, role: r } });
    check(`register ${r} -> 201`, x.status === 201 && !x.body.hashed_password);
  }
  check("register missing field -> 400", (await call(AUTH, "POST", "/register", { body: { username: "x" } })).status === 400);
  check("register bad role -> 400", (await call(AUTH, "POST", "/register", { body: { username: "y" + s, password: pw, role: "god" } })).status === 400);
  const dup = await call(AUTH, "POST", "/register", { body: { username: u("reader"), password: pw, role: "reader" } });
  check("register duplicate -> 409 {error}", dup.status === 409 && typeof dup.body.error === "string");

  check("login missing field -> 400", (await call(AUTH, "POST", "/login", { body: { username: "a" } })).status === 400);
  check("login wrong password -> 401", (await call(AUTH, "POST", "/login", { body: { username: u("author"), password: "nope" } })).status === 401);

  const tok = {};
  for (const r of ["reader", "author", "admin"]) {
    const x = await call(AUTH, "POST", "/login", { body: { username: u(r), password: pw } });
    tok[r] = x.body;
    check(`login ${r} -> 200 with both tokens`, x.status === 200 && x.body.accessToken && x.body.refreshToken);
  }
  const a = jwt.decode(tok.author.accessToken), rf = jwt.decode(tok.author.refreshToken);
  check("access token = {id,username,role}, 15 min", a.username === u("author") && a.role === "author" && a.exp - a.iat === 900);
  check("refresh token type=refresh, 7 days", rf.type === "refresh" && rf.exp - rf.iat === 7 * 86400);

  check("refresh missing -> 400", (await call(AUTH, "POST", "/refresh", { body: {} })).status === 400);
  check("refresh garbage -> 401", (await call(AUTH, "POST", "/refresh", { body: { refreshToken: "abc" } })).status === 401);
  check("refresh with ACCESS token -> 401", (await call(AUTH, "POST", "/refresh", { body: { refreshToken: tok.author.accessToken } })).status === 401);
  const ref = await call(AUTH, "POST", "/refresh", { body: { refreshToken: tok.author.refreshToken } });
  check("refresh valid -> 200 new accessToken", ref.status === 200 && ref.body.accessToken && !ref.body.refreshToken);
  const forged = jwt.sign({ id: 1, type: "refresh" }, "wrong-secret");
  check("refresh forged -> 401", (await call(AUTH, "POST", "/refresh", { body: { refreshToken: forged } })).status === 401);

  // --- Blog API
  const B = (m, p, o) => call(BLOG, m, p, o);
  check("GET /api/posts public -> 200", (await B("GET", "/api/posts")).status === 200);
  check("GET post missing -> 404", (await B("GET", "/api/posts/99999")).status === 404);
  check("POST no token -> 401", (await B("POST", "/api/posts", { body: { title: "t", content: "c" } })).status === 401);
  check("POST reader -> 403", (await B("POST", "/api/posts", { token: tok.reader.accessToken, body: { title: "t", content: "c" } })).status === 403);
  check("POST author missing content -> 400", (await B("POST", "/api/posts", { token: tok.author.accessToken, body: { title: "t" } })).status === 400);
  check("POST with REFRESH token -> 401", (await B("POST", "/api/posts", { token: tok.author.refreshToken, body: { title: "t", content: "c" } })).status === 401);
  check("POST expired token -> 401", (await B("POST", "/api/posts", { token: jwt.sign({ id: 1, username: "e", role: "admin" }, process.env.JWT_SECRET, { expiresIn: -10 }), body: { title: "t", content: "c" } })).status === 401);

  const made = await B("POST", "/api/posts", { token: tok.author.accessToken, body: { title: "Hello", content: "World", authorId: 9999 } });
  check("POST author -> 201, authorId from token", made.status === 201 && made.body.authorId === a.id);
  const adminPost = await B("POST", "/api/posts", { token: tok.admin.accessToken, body: { title: "Admin", content: "post" } });
  check("POST admin -> 201", adminPost.status === 201);
  const id = made.body.id;
  check("GET one -> 200", (await B("GET", `/api/posts/${id}`)).body.title === "Hello");

  check("PUT no token -> 401", (await B("PUT", `/api/posts/${id}`, { body: { title: "x" } })).status === 401);
  check("PUT non-owner author/reader -> 403", (await B("PUT", `/api/posts/${id}`, { token: tok.reader.accessToken, body: { title: "x" } })).status === 403);
  check("PUT missing post -> 404", (await B("PUT", "/api/posts/99999", { token: tok.admin.accessToken, body: { title: "x" } })).status === 404);
  check("PUT empty body -> 400", (await B("PUT", `/api/posts/${id}`, { token: tok.author.accessToken, body: {} })).status === 400);
  check("PUT owner -> 200", (await B("PUT", `/api/posts/${id}`, { token: tok.author.accessToken, body: { title: "Edited" } })).body.title === "Edited");
  check("PUT admin on others' post -> 200", (await B("PUT", `/api/posts/${id}`, { token: tok.admin.accessToken, body: { content: "By admin" } })).body.content === "By admin");

  const mine = await B("GET", "/api/me/posts", { token: tok.author.accessToken });
  check("GET /api/me/posts only own", mine.status === 200 && mine.body.every((p) => p.authorId === a.id) && mine.body.length === 1);
  check("GET /api/me/posts reader -> 200 []", (await B("GET", "/api/me/posts", { token: tok.reader.accessToken })).body.length === 0);
  check("GET /api/me/posts no token -> 401", (await B("GET", "/api/me/posts")).status === 401);

  check("DELETE no token -> 401", (await B("DELETE", `/api/posts/${id}`)).status === 401);
  check("DELETE author (owner) -> 403", (await B("DELETE", `/api/posts/${id}`, { token: tok.author.accessToken })).status === 403);
  check("DELETE admin missing -> 404", (await B("DELETE", "/api/posts/99999", { token: tok.admin.accessToken })).status === 404);
  check("DELETE admin -> 200", (await B("DELETE", `/api/posts/${id}`, { token: tok.admin.accessToken })).status === 200);
  check("deleted post -> 404", (await B("GET", `/api/posts/${id}`)).status === 404);

  // --- Logout
  check("logout missing -> 400", (await call(AUTH, "POST", "/logout", { body: {} })).status === 400);
  check("logout -> 200", (await call(AUTH, "POST", "/logout", { body: { refreshToken: tok.author.refreshToken } })).status === 200);
  check("refresh after logout -> 401", (await call(AUTH, "POST", "/refresh", { body: { refreshToken: tok.author.refreshToken } })).status === 401);
  const relog = await call(AUTH, "POST", "/login", { body: { username: u("author"), password: pw } });
  check("login again works after logout", relog.status === 200);
  check("old refresh token dead after new login", (await call(AUTH, "POST", "/refresh", { body: { refreshToken: tok.author.refreshToken } })).status === 401);
  check("unknown route -> 404 {error}", typeof (await B("GET", "/nope")).body.error === "string");
  check("bad JSON -> 400 {error}", await fetch(AUTH + "/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{bad" }).then(async (r) => r.status === 400 && !!(await r.json()).error));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
