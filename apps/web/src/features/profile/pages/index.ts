import { lazy } from "react";

export const ProfileSettingsPage = lazy(
  () => import("./profile-settings-page")
);
export const SecuritySettingsPage = lazy(
  () => import("./security-settings-page")
);
