export type AppRoute = {
  path: string;
  label: string;
  element: React.ReactNode;
  icon?: string | React.ComponentType;
  permissions?: string[];
  showInSidebar?: boolean;
  children?: AppRoute[];
};
