import { Router } from "express";

import { clientsRouter } from "@/modules/clients/clients.routes";
import { invitationsRouter } from "@/modules/invitations/invitations.routes";
import { profileRouter } from "@/modules/profile/profile.routes";
import { rolesRouter } from "@/modules/roles/roles.routes";
import { usersRouter } from "@/modules/users/users.routes";

const appRouter = Router();

appRouter.use("/me", profileRouter);
appRouter.use("/clients", clientsRouter);
appRouter.use("/invitations", invitationsRouter);
appRouter.use("/roles", rolesRouter);
appRouter.use("/users", usersRouter);

export { appRouter };
