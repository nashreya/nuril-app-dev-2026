import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { formatDate } from "../components/PostCard.jsx";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getPost(id).then(setPost).catch((e) => setError(e.message));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this post for everyone?")) return;
    try {
      await api.deletePost(post.id);
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  }

  if (error && !post) return <div className="card narrow"><p className="alert">{error}</p><Link to="/">← Back to posts</Link></div>;
  if (!post) return <p className="muted">Loading…</p>;

  const canEdit = user && (user.role === "admin" || user.id === post.authorId);
  const canDelete = user && user.role === "admin";

  return (
    <article className="card article">
      <Link to="/" className="muted">← All posts</Link>
      <h1>{post.title}</h1>
      <p className="meta">
        <span>By <strong>{post.authorName}</strong></span>
        <span>{formatDate(post.created_at)}</span>
        {post.updated_at !== post.created_at && <span>edited {formatDate(post.updated_at)}</span>}
      </p>
      <div className="body">{post.content}</div>
      {error && <p className="alert">{error}</p>}
      {(canEdit || canDelete) && (
        <div className="row">
          {canEdit && <Link className="btn" to={`/posts/${post.id}/edit`}>Edit</Link>}
          {canDelete && <button className="btn btn-danger" onClick={handleDelete}>Delete</button>}
        </div>
      )}
    </article>
  );
}
