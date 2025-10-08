import express from "express";
import { addComment, approveComment, listComments } from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Readers: add comment
router.post("/", protect, addComment);

// Editors/Admins: approve comment
router.put("/:id/approve", protect, approveComment);

// Everyone: list approved comments for a post
router.get("/:postId", listComments);

export default router;