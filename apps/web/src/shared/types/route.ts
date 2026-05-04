import { type IconName, SIDEBAR_GROUPS } from "@/shared/constants";

export type SidebarGroupKey = (typeof SIDEBAR_GROUPS)[number];

export type AppRoute = {
  path: string;
  label: string;
  element: React.ReactNode;
  icon?: IconName;
  permissions?: string[];
  showInSidebar?: boolean;
  sideBarGroup?: SidebarGroupKey;
  public?: boolean;
  guestOnly?: boolean;
  children?: AppRoute[];
};
