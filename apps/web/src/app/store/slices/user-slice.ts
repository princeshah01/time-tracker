import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User, Permission } from "@/shared/types";

export interface UserState {
  user: User | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
}

const initialState: UserState = {
  user: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,
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
      action: PayloadAction<{ user: User; permissions: Permission[] }>
    ) => {
      state.user = action.payload.user;
      state.permissions = action.payload.permissions;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isHydrated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.permissions = [];
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isHydrated = true;
    },
  },
});

export const { setAuthLoading, setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
