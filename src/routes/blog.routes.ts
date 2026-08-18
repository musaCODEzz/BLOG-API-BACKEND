import express, {type Router} from "express";
import { getBlogs, postBlog, putBlog, deleteBlog} from "../controllers/blog.controller.js";
import { validateBlogPost } from "../middlewares/validateBlog.js";


export const blogRouter: Router = express.Router();

blogRouter.get("/", getBlogs);
blogRouter.post("/", validateBlogPost, postBlog);
blogRouter.put("/:id", validateBlogPost, putBlog);
blogRouter.delete("/:id", deleteBlog);