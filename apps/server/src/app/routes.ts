import { Router } from "express";

import { clientsRouter } from "@/modules/clients/clients.routes";
import { invitationsRouter } from "@/modules/invitations/invitations.routes";
import { profileRouter } from "@/modules/profile/profile.routes";
import { projectsRouter } from "@/modules/projects/projects.routes";
import { rolesRouter } from "@/modules/roles/roles.routes";
import { tasksRouter } from "@/modules/tasks/tasks.routes";
import { usersRouter } from "@/modules/users/users.routes";

const appRouter = Router();

appRouter.use("/me", profileRouter);
appRouter.use("/client", clientsRouter);
appRouter.use("/clients", clientsRouter);
appRouter.use("/projects", projectsRouter);
appRouter.use("/tasks", tasksRouter);
appRouter.use("/invitations", invitationsRouter);
appRouter.use("/roles", rolesRouter);
appRouter.use("/users", usersRouter);

export { appRouter };
