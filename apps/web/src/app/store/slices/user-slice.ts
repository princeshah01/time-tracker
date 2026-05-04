import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Permission, Role, User } from "@/shared/types";

export interface UserState {
  user: User | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  role: Role | null;
}

const initialState: UserState = {
  user: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,
  role: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuthLoading: (state) => {
      state.isLoading = true;
    },
    setUser: (
      state,
      action: PayloadAction<{
        user: User;
        role: Role | null;
        permissions: Permission[];
      }>
    ) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.permissions = action.payload.permissions;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isHydrated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.permissions = [];
      state.role = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isHydrated = true;
    },
  },
});

export const { setAuthLoading, setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
