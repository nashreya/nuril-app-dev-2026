import { Link } from "react-router-dom";

export const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

export default function PostCard({ post, children }) {
  return (
    <article className="card post-card">
      <h2><Link to={`/posts/${post.id}`}>{post.title}</Link></h2>
      <p className="excerpt">{post.content.length > 180 ? post.content.slice(0, 180) + "…" : post.content}</p>
      <footer className="meta">
        <span>By <strong>{post.authorName}</strong></span>
        <span>{formatDate(post.created_at)}</span>
        {children && <span className="actions">{children}</span>}
      </footer>
    </article>
  );
}
