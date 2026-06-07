import { Router } from "express";
import { usersRoute } from "./users";

export const routes = Router();

routes.use(usersRoute);
