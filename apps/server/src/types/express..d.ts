import type { AuthSession, AuthUser } from "@/shared/session";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      session?: AuthSession;
    }
  }
}
