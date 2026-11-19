import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

// Hides pages from visitors who are logged out or whose role is not allowed.
// (This is only UX. The Blog Server enforces the real rules with authenticate/authorize.)
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="card narrow">
        <h2>Not allowed</h2>
        <p className="muted">Your role (<strong>{user.role}</strong>) cannot open this page. Register as an author or admin to write posts.</p>
      </div>
    );
  }
  return children;
}
