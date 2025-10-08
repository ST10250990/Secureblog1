const Post = require("../models/Post");

// Create draft → authors only
exports.createDraft = async (req, res) => {
  try {
    if (req.user.role !== "author") {
      return res.status(403).json({ message: "Only authors can create drafts." });
    }

    const post = new Post({
      title: req.body.title,
      body: req.body.body,
      status: "draft",
      author: req.user._id,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit draft → only by the author of that draft
exports.editDraft = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found." });
    if (post.status !== "draft")
      return res.status(400).json({ message: "Only drafts can be edited." });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "You can only edit your own drafts." });

    post.title = req.body.title || post.title;
    post.body = req.body.body || post.body;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Publish post → editors or admins
exports.publishPost = async (req, res) => {
  try {
    if (!["editor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only editors or admins can publish." });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    post.status = "published";
    post.publishedAt = new Date();

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete post → admins only
exports.deletePost = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete posts." });
    }

    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    res.json({ message: "Post deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List published posts → open to all roles
exports.listPublishedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "published" }).populate("author", "username email");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View single published post → open to all roles
exports.viewPublishedPost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, status: "published" }).populate(
      "author",
      "username email"
    );

    if (!post) return res.status(404).json({ message: "Post not found." });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};