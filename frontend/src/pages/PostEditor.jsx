import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";

// One form for both "new post" and "edit post" (edit when the URL has an :id)
export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (id) api.getPost(id).then((p) => setForm({ title: p.title, content: p.content })).catch((e) => setError(e.message));
  }, [id]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const post = id ? await api.updatePost(id, form) : await api.createPost(form);
      navigate(`/posts/${post.id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="card narrow form" onSubmit={submit}>
      <h1>{id ? "Edit post" : "New post"}</h1>
      <label>Title
        <input value={form.title} maxLength={255} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </label>
      <label>Content
        <textarea rows={12} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
      </label>
      {error && <p className="alert">{error}</p>}
      <div className="row">
        <button className="btn" disabled={busy}>{busy ? "Saving…" : id ? "Save changes" : "Publish"}</button>
        <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </form>
  );
}
