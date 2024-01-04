import { nanoid } from "nanoid";
import { generateUploadUrl } from "../../helpers/aws.js";
import Blog from "../../Schema/Blog.js";
import User from "../../Schema/User.js";

/* 
    @title Image Upload Url
    @route GET /api/v1/post/image-upload-url
    @desc Gets the aws image upload url
    @access Public
*/
const getImageUploadUrl = async (req, res) => {
  await generateUploadUrl()
    .then((url) =>
      res.status(200).json({
        uploadUrl: url,
      })
    )
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({
        error: err.message,
      });
    });
};

/* 
    @title Create Post
    @route Post /api/v1/post/create-post
    @desc Creates a new blog post
    @access Public
*/
const createPost = async (req, res) => {
  const authorId = req.user;

  let { title, banner, content, desc, tags, draft } = req.body;

  // Validate entries
  if (!title.length) {
    return res.status(403).json({
      error: "Please provide a title",
    });
  }

  // Don't validate entries if saving to draft
  if (!draft) {
    if (!banner.length) {
      return res.status(403).json({
        error: "Please provide a post banner",
      });
    }

    if (!desc.length || desc.length > 200) {
      return res.status(403).json({
        error: "You must provide a description not more than 200 characters.",
      });
    }

    if (!content.blocks.length) {
      return res.status(403).json({
        error: "Please provide post content to publish it.",
      });
    }

    if (!tags.length || tags.length > 10) {
      return res.status(403).json({
        error: "Please provide post tags not more than 10.",
      });
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());

  // Replace special chars in title
  let blogId =
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();

  // Create blog post object
  let blog = new Blog({
    title,
    banner,
    content,
    desc,
    tags,
    author: authorId,
    blogId,
    draft: Boolean(draft),
  });

  // Save in db, update total post count in account info and update blogs array for the user
  blog
    .save()
    .then((blog) => {
      let incrementVal = draft ? 0 : 1;
      // Find the user from the users collection to update blog value
      User.findOneAndUpdate(
        {
          _id: authorId,
        },
        {
          $inc: { "accountInfo.total_posts": incrementVal },
          $push: { blogs: blog._id },
        }
      )
        .then((user) => {
          return res.status(200).json({
            id: blog.blogId,
          });
        })
        .catch((err) => {
          return res.status(500).json({
            error: "Failed to update total posts number",
          });
        });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err.message,
      });
    });
};

export { getImageUploadUrl, createPost };
