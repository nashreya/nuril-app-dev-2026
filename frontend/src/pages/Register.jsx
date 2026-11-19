import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "reader" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.register(form);
      await login(form.username, form.password); // sign them straight in
      navigate("/");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="card narrow form" onSubmit={submit}>
      <h1>Create an account</h1>
      <label>Username<input value={form.username} maxLength={50} autoComplete="username" onChange={set("username")} required /></label>
      <label>Email<input type="email" value={form.email} autoComplete="email" onChange={set("email")} required /></label>
      <label>Password <small className="muted">(6+ characters)</small>
        <input type="password" value={form.password} minLength={6} autoComplete="new-password" onChange={set("password")} required />
      </label>
      <label>Role
        <select value={form.role} onChange={set("role")}>
          <option value="reader">Reader – read posts</option>
          <option value="author">Author – write and edit own posts</option>
          <option value="admin">Admin – edit and delete any post</option>
        </select>
      </label>
      {error && <p className="alert">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? "Creating…" : "Sign up"}</button>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </form>
  );
}
