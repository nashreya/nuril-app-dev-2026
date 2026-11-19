import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import PostCard from "../components/PostCard.jsx";

export default function MyPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState("");
  const canWrite = user.role === "author" || user.role === "admin";

  const load = () => api.myPosts().then(setPosts).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm("Delete this post?")) return;
    try {
      await api.deletePost(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <div className="row between">
        <h1>My posts</h1>
        {canWrite && <Link className="btn" to="/posts/new">New post</Link>}
      </div>
      {!canWrite && <p className="card muted">You are a <strong>reader</strong>. You have no writing access.</p>}
      {error && <p className="alert">{error}</p>}
      {posts && posts.length === 0 && canWrite && <p className="muted">You have not written anything yet.</p>}
      <div className="grid">
        {posts?.map((p) => (
          <PostCard key={p.id} post={p}>
            <Link to={`/posts/${p.id}/edit`}>Edit</Link>
            {user.role === "admin" && <button className="link danger" onClick={() => remove(p.id)}>Delete</button>}
          </PostCard>
        ))}
      </div>
    </>
  );
}
