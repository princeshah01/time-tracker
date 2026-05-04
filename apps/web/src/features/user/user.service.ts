import { apiFetch } from "@/shared/lib";
import { MeResponse } from "./user.type";
import { authClient } from "@/shared/lib";

const userService = {
  getProfile: async () => {
    const response = await apiFetch<MeResponse>({
      url: "/me",
      method: "GET",
    });
    return response;
  },
  updateProfile: async (data: FormData) => {
    const response = await apiFetch<MeResponse>({
      url: "/me",
      method: "PATCH",
      data,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },
  setPassword: async (newPassword: string) => {
    const response = await apiFetch<{ success: boolean }>({
      url: "/me/set-password",
      method: "POST",
      data: {
        newPassword,
      },
    });
    return response;
  },
  LogOut: async () => {
    const response = await authClient.signOut();
    return response;
  },
};

export { userService };
