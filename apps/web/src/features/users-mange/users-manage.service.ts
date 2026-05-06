import { apiFetch } from "@/shared/lib";
import type { UserSearchRequestBody, UserSearchResponse } from "./users-manage.types";


const userManageService = {
    searchUsers: async (body: UserSearchRequestBody) => {
        const response = await apiFetch<UserSearchResponse>({
            url: "/users/search",
            method: "POST",  
            data: body,
        });
        return response;
    }
};

export { userManageService };
