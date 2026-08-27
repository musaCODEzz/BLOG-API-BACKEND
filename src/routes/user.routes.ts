import express, {type Router} from "express";
import { registerUser, login} from "../controllers/user.controller.js";
import { validateUser } from "../middlewares/validateUser.js";

export const userRouter: Router = express.Router();

userRouter.post("/register", validateUser, registerUser);
userRouter.post("/login", login);