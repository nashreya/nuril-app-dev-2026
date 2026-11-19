import { useEffect, useState } from "react";
import { api } from "../api.js";
import PostCard from "../components/PostCard.jsx";
import Hero from "../components/Hero.jsx";

export default function Home() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    api.listPosts().then(setPosts).catch((e) => setError(e.message));
  }, []);

  const shown = posts?.filter((p) => (p.title + p.content + p.authorName).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <section className="hero">
        <Hero />
        <div className="hero-card">
          <h1>Craft wanders, block by block.</h1>
          <p>Discover stories, ideas, and insights from creators around the world.</p>
          <input className="search" placeholder="Search posts…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </section>
      {error && <p className="alert">{error}</p>}
      {!posts && !error && <p className="muted">Loading posts…</p>}
      {shown && shown.length === 0 && <p className="muted">No posts found.</p>}
      <div className="grid">{shown?.map((p) => <PostCard key={p.id} post={p} />)}</div>
    </>
  );
}
