export type UserSearchRequestBody = {
    q: string;
    type: "invite";
    excludeSelf?: boolean;
    limit?: number;
}

export type UserSearchResponse = {
    suggestedUsers: {
        email: string;
        name: string;
        role: string;
        canSendInvite?: boolean;
    }[];
}