import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setAccessToken, subscribeToken, refreshSession, hadSession } from "./api.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Read { id, username, role } out of the access token. This is only for showing the UI
// (name, badge, which buttons to show). The Blog Server re-checks the token on every request.
function userFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return { id: payload.id, username: payload.username, role: payload.role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    subscribeToken((token) => setUser(userFromToken(token)));
    // On page load, try to restore the session from the refresh cookie
    if (hadSession()) refreshSession().finally(() => setReady(true));
    else setReady(true);
  }, []);

  const login = useCallback(async (username, password) => {
    const { accessToken } = await api.login({ username, password });
    setAccessToken(accessToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setAccessToken(null);
    }
  }, []);

  return <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>;
}
