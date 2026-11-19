import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const canWrite = user && (user.role === "author" || user.role === "admin");

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand"><span className="logo" aria-hidden="true"><i /><i /></span>Blockbox</Link>
        <nav className="nav-links">
          <NavLink to="/" end>Posts</NavLink>
          {user && <NavLink to="/me">My posts</NavLink>}
          {canWrite && <NavLink to="/posts/new">Write</NavLink>}
        </nav>
        <div className="nav-user">
          {user ? (
            <>
              <span className="who">{user.username}</span>
              <span className={`badge badge-${user.role}`}>{user.role}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/register" className="btn">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
