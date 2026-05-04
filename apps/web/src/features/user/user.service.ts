import { apiFetch } from "@/shared/lib";
import { MeResponse } from "./user.type";
const userService = {
  getProfile: async () => {
    const response = await apiFetch<MeResponse>({
      url: "/me",
      method: "GET",
    });
    return response;
  },
};

export { userService };
