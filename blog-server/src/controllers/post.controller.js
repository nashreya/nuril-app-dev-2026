const Post = require("../models/post.model");

const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";

// Loads :id and answers 404 itself; returns undefined when it has responded
async function findPostOr404(req, res) {
  const id = Number(req.params.id);
  const post = Number.isInteger(id) && id > 0 ? await Post.findById(id) : undefined;
  if (!post) res.status(404).json({ error: "Post not found" });
  return post;
}

exports.listPosts = async (req, res) => res.status(200).json(await Post.findAll());

exports.getPost = async (req, res) => {
  const post = await findPostOr404(req, res);
  if (post) res.status(200).json(post);
};

exports.createPost = async (req, res) => {
  const { title, content } = req.body || {};
  if (!isNonEmptyString(title) || !isNonEmptyString(content)) {
    return res.status(400).json({ error: "title and content are required" });
  }
  if (title.trim().length > 255) {
    return res.status(400).json({ error: "title must be at most 255 characters" });
  }
  // authorId always comes from the verified token, never from the body
  const post = await Post.create({ authorId: req.user.id, title: title.trim(), content: content.trim() });
  res.status(201).json(post);
};

exports.updatePost = async (req, res) => {
  const post = await findPostOr404(req, res);
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
  if (title !== undefined && title.trim().length > 255) {
    return res.status(400).json({ error: "title must be at most 255 characters" });
  }

  res.status(200).json(
    await Post.update(post.id, {
      title: title === undefined ? undefined : title.trim(),
      content: content === undefined ? undefined : content.trim(),
    })
  );
};

exports.deletePost = async (req, res) => {
  const post = await findPostOr404(req, res);
  if (!post) return;
  await Post.remove(post.id);
  res.status(200).json({ message: "Post deleted" });
};

exports.listMyPosts = async (req, res) => res.status(200).json(await Post.findByAuthor(req.user.id));
