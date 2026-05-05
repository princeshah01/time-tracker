import { Router } from "express";

import { invitationsRouter } from "@/modules/invitations/invitations.routes";
import { profileRouter } from "@/modules/profile/profile.routes";
import { rolesRouter } from "@/modules/roles/roles.routes";

const appRouter = Router();

appRouter.use("/me", profileRouter);
appRouter.use("/invitations", invitationsRouter);
appRouter.use("/roles", rolesRouter);

export { appRouter };
