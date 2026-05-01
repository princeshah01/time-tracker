import { createAuthClient } from "better-auth/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { env } from "./shared/config";

const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
    baseURL: env.VITE_API_BASE_URL,
    plugins: [emailOTPClient()],
})

export { authClient }