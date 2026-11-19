// All HTTP goes through here. Two ideas:
//  1. The access token lives only in memory (a variable), never in localStorage.
//  2. If a request gets 401, we ask the Auth Server for a new access token using the
//     httpOnly refresh cookie, then retry the request once.

let accessToken = null;
let onTokenChange = () => {};
let refreshing = null; // share one refresh call between simultaneous requests

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// A non-secret flag (not the token!) remembering "this browser had a session", so visitors who never
// logged in don't trigger a pointless /auth/refresh call on every page load.
const FLAG = "hasSession";
export const hadSession = () => {
  try { return localStorage.getItem(FLAG) === "1"; } catch { return false; }
};

export function setAccessToken(token) {
  accessToken = token;
  try { token ? localStorage.setItem(FLAG, "1") : localStorage.removeItem(FLAG); } catch { /* storage blocked: fine */ }
  onTokenChange(token);
}
export const subscribeToken = (fn) => (onTokenChange = fn);

async function parse(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  return data;
}

// Ask the Auth Server for a new access token. The cookie is sent automatically.
export function refreshSession() {
  if (!refreshing) {
    refreshing = fetch("/auth/refresh", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
      .then(parse)
      .then((d) => {
        setAccessToken(d.accessToken);
        return true;
      })
      .catch(() => {
        setAccessToken(null);
        return false;
      })
      .finally(() => (refreshing = null));
  }
  return refreshing;
}

async function request(url, { method = "GET", body } = {}, canRetry = true) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...(accessToken && { Authorization: `Bearer ${accessToken}` }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401 && accessToken && canRetry) {
    if (await refreshSession()) return request(url, { method, body }, false);
  }
  return parse(res);
}

export const api = {
  // auth server
  register: (b) => request("/auth/register", { method: "POST", body: b }),
  login: (b) => request("/auth/login", { method: "POST", body: b }),
  logout: () => request("/auth/logout", { method: "POST", body: {} }),
  // blog server
  listPosts: () => request("/api/posts"),
  getPost: (id) => request(`/api/posts/${id}`),
  createPost: (b) => request("/api/posts", { method: "POST", body: b }),
  updatePost: (id, b) => request(`/api/posts/${id}`, { method: "PUT", body: b }),
  deletePost: (id) => request(`/api/posts/${id}`, { method: "DELETE" }),
  myPosts: () => request("/api/me/posts"),
};
