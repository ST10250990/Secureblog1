import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

// 1) Readers can submit comments
export const addComment = async (req, res) => {
  try {
    const { postId, text } = req.body;

    const post = await Post.findById(postId);
    if (!post || post.status !== "published") {
      return res.status(400).json({ message: "Post not found or not published" });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id, // logged in user
      text,
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2) Editors/Admins approve comments
export const approveComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!["editor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only editors or admins can approve comments" });
    }

    const comment = await Comment.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3) Everyone can view approved comments for a post
export const listComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId, status: "approved" })
      .populate("author", "username email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};