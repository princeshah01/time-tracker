export type AppRoute = {
  path: string;
  label: string;
  element: React.ReactNode;
  icon?: string | React.ComponentType;
  permissions?: string[];
  showInSidebar?: boolean;
  public?: boolean;
  children?: AppRoute[];
};
