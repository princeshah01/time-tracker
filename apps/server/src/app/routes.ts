import { Router } from "express";

import { invitesRouter } from "@/modules/invites/invites.routes";
import { profileRouter } from "@/modules/profile/profile.routes";
import { securityRouter } from "@/modules/security/security.routes";

const appRouter = Router();

appRouter.use("/profile", profileRouter);
appRouter.use("/invites", invitesRouter);
appRouter.use("/security", securityRouter);

export { appRouter };
