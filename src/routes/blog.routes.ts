import express, {type Router} from "express";
import { getBlogs, postBlog } from "../controllers/blog.controller.js";

export const blogRouter: Router = express.Router();

blogRouter.get("/", getBlogs);
blogRouter.post("/", postBlog);