import { Router } from "express";
import { postsRoute } from "./posts";
import { usersRoute } from "./users";

export const routes = Router();

routes.use(usersRoute);
routes.use(postsRoute);
