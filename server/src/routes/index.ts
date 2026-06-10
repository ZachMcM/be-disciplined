import { Router } from "express";
import { friendsRoute } from "./friends";
import { postsRoute } from "./posts";
import { usersRoute } from "./users";

export const routes = Router();

routes.use(usersRoute);
routes.use(postsRoute);
routes.use(friendsRoute);
