import { Schema, model } from "mongoose";

const blogSchema = Schema(
  {
    blogId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
    },
    desc: {
      type: String,
      maxlength: 200,
    },
    content: {
      type: [],
    },
    tags: {
      type: [String],
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    activity: {
      total_likes: {
        type: Number,
        default: 0,
      },
      total_comments: {
        type: Number,
        default: 0,
      },
      total_reads: {
        type: Number,
        default: 0,
      },
      total_parent_comments: {
        type: Number,
        default: 0,
      },
    },
    comments: {
      type: [Schema.Types.ObjectId],
      ref: "Comment",
    },
    draft: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "publishedAt",
    },
  }
);

const Blog = model("Blog", blogSchema);

export default Blog;
