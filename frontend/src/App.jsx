import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import PostEditor from "./pages/PostEditor.jsx";
import MyPosts from "./pages/MyPosts.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { useAuth } from "./AuthContext.jsx";

export default function App() {
  const { ready } = useAuth();
  if (!ready) return <p className="center muted">Loading…</p>;

  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/me" element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />
          <Route path="/posts/new" element={<ProtectedRoute roles={["author", "admin"]}><PostEditor /></ProtectedRoute>} />
          <Route path="/posts/:id/edit" element={<ProtectedRoute roles={["author", "admin"]}><PostEditor /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
