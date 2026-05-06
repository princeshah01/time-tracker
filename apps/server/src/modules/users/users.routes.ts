import { Router } from "express";

import { requireAuth, validate } from "@/shared/middlewares";
import { usersController } from "./users.controllers";
import { searchUsersSchema } from "./users.validation";

const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.post("/search", validate(searchUsersSchema), usersController.search);

export { usersRouter };
