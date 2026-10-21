const Post = require("../models/post.model");

const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";

// Loads :id, answers 400/404 itself and returns null when it has responded
function findPostOr404(req, res) {
  const id = Number(req.params.id);
  const post = Number.isInteger(id) ? Post.findById(id) : undefined;
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return null;
  }
  return post;
}

exports.listPosts = (req, res) => res.status(200).json(Post.findAll());

exports.getPost = (req, res) => {
  const post = findPostOr404(req, res);
  if (post) res.status(200).json(post);
};

exports.createPost = (req, res) => {
  const { title, content } = req.body || {};
  if (!isNonEmptyString(title) || !isNonEmptyString(content)) {
    return res.status(400).json({ error: "title and content are required" });
  }
  // authorId always comes from the verified token, never from the body
  const post = Post.create({ authorId: req.user.id, title: title.trim(), content: content.trim() });
  res.status(201).json(post);
};

exports.updatePost = (req, res) => {
  const post = findPostOr404(req, res);
  if (!post) return;

  // Ownership check: the post's author or an admin
  if (post.authorId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "You can only edit your own posts" });
  }

  const { title, content } = req.body || {};
  if (title === undefined && content === undefined) {
    return res.status(400).json({ error: "Provide title and/or content to update" });
  }
  if ((title !== undefined && !isNonEmptyString(title)) || (content !== undefined && !isNonEmptyString(content))) {
    return res.status(400).json({ error: "title and content must be non-empty text" });
  }

  res.status(200).json(
    Post.update(post, {
      title: title === undefined ? undefined : title.trim(),
      content: content === undefined ? undefined : content.trim(),
    })
  );
};

exports.deletePost = (req, res) => {
  const post = findPostOr404(req, res);
  if (!post) return;
  Post.remove(post);
  res.status(200).json({ message: "Post deleted" });
};

exports.listMyPosts = (req, res) => res.status(200).json(Post.findByAuthor(req.user.id));
