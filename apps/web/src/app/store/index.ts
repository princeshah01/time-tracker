import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/user-slice";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-exporting slices and hooks for easier imports in components
export * from "./slices/user-slice";
export * from "./hooks";
