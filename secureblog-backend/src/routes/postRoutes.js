const express = require("express");
const router = express.Router();
const PostController = require("../controllers/postController");
const CommentController = require("../controllers/commentController");

// CRUD for posts
router.post("/", PostController.createPost);
router.get("/", PostController.getAllPosts);
router.get("/:id", PostController.getPostById);
router.put("/:id", PostController.updatePost);
router.delete("/:id", PostController.deletePost);

// Nested comments for posts
router.post("/:postId/comments", CommentController.createComment);
router.get("/:postId/comments", CommentController.getApprovedComments);

// Admin/Editor: approve comment
router.put("/:postId/comments/:commentId/approve", CommentController.approveComment);

module.exports = router;