// models/Post.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User", // assumes you have a User model
      required: true,
    },
    publishDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Middleware: auto-set publishDate if status = published
postSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "published" && !this.publishDate) {
    this.publishDate = new Date();
  }
  next();
});

// Rules helpers
postSchema.methods.isEditableBy = function (user) {
  // Author can only edit draft
  if (this.status === "draft" && this.author.equals(user._id)) {
    return true;
  }
  // Editors/admins can always edit
  return user.role === "editor" || user.role === "admin";
};

postSchema.methods.isDeletableBy = function (user) {
  // Only admin can hard delete
  return user.role === "admin";
};

const Post = mongoose.model("Post", postSchema);

export default Post;