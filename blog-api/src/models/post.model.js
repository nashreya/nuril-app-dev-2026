// Posts live in an in-memory array, loaded from localStorage at startup and saved after every change.
// Shape: { id, authorId, title, content, created_at, updated_at }
const storage = require("../utils/localStorage");

const KEY = "posts";

function load() {
  try {
    const parsed = JSON.parse(storage.getItem(KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const posts = load();
let nextId = posts.reduce((max, p) => Math.max(max, p.id), 0) + 1;

const save = () => storage.setItem(KEY, JSON.stringify(posts));

exports.findAll = () => posts;
exports.findById = (id) => posts.find((p) => p.id === id);
exports.findByAuthor = (authorId) => posts.filter((p) => p.authorId === authorId);

exports.create = ({ authorId, title, content }) => {
  const now = new Date().toISOString();
  const post = { id: nextId++, authorId, title, content, created_at: now, updated_at: now };
  posts.push(post);
  save();
  return post;
};

exports.update = (post, { title, content }) => {
  if (title !== undefined) post.title = title;
  if (content !== undefined) post.content = content;
  post.updated_at = new Date().toISOString();
  save();
  return post;
};

exports.remove = (post) => {
  posts.splice(posts.indexOf(post), 1);
  save();
};
