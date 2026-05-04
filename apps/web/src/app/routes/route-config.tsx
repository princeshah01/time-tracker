import {
  AcceptInvitePage,
  AuthPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "@/features/auth/pages";
import { SettingsPage } from "@/features/settings";
import type { AppRoute } from "@/shared/types";

export const appRoutes: AppRoute[] = [
  // --------------------
  // AUTH ROUTES
  // --------------------
  {
    path: "/auth",
    label: "Auth",
    element: <AuthPage />,
    public: true,
    guestOnly: true,
  },
  {
    path: "/accept-invite",
    label: "Accept Invite",
    element: <AcceptInvitePage />,
    public: true,
    guestOnly: true,
  },
  {
    path: "/forgot-password",
    label: "Forgot Password",
    element: <ForgotPasswordPage />,
    public: true,
    guestOnly: true,
  },
  {
    path: "/reset-password",
    label: "Reset Password",
    element: <ResetPasswordPage />,
    public: true,
    guestOnly: true,
  },
  // --------------------
  // DASHBOARD
  // --------------------
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    element: <div>Dashboard Overview</div>,
    showInSidebar: true,
    sideBarGroup: "General",
    permissions: [],
  },

  // --------------------
  // CLIENTS
  // --------------------
  {
    path: "/clients",
    label: "Clients",
    icon: "Users",
    element: <div>Clients Overview</div>,
    showInSidebar: true,
    sideBarGroup: "Management",
  },
  {
    path: "/clients/new",
    label: "Create Client",
    element: <div>Create Client</div>,
  },
  {
    path: "/clients/:clientId",
    label: "Client Details",
    element: <div>Client Details</div>,
  },
  // --------------------
  // PROJECTS
  // --------------------
  {
    path: "/projects",
    label: "Projects",
    icon: "FolderKanban",
    element: <div>Projects Overview</div>,
    showInSidebar: true,
    sideBarGroup: "Management",
  },
  {
    path: "/projects/new",
    label: "Create Project",
    element: <div>Create Project</div>,
  },
  {
    path: "/projects/:projectId",
    label: "Project Details",
    element: <div>Project Details</div>,
  },
  // --------------------
  // TASKS
  // --------------------
  {
    path: "/tasks",
    label: "Tasks",
    icon: "CheckSquare",
    element: <div>Tasks Overview</div>,
    showInSidebar: true,
    sideBarGroup: "Management",
  },
  {
    path: "/tasks/new",
    label: "Create Task",
    element: <div>Create Task</div>,
  },
  {
    path: "/tasks/:taskId",
    label: "Task Details",
    element: <div>Task Details</div>,
  },

  // --------------------
  // TIMESHEETS
  // --------------------
  {
    path: "/timesheets",
    label: "Timesheets",
    icon: "Clock",
    element: <div>Timesheets Overview</div>,
    showInSidebar: true,
    sideBarGroup: "Management",
  },
  {
    path: "/timesheets/new",
    label: "Create Timesheet",
    element: <div>Create Timesheet</div>,
  },
  {
    path: "/timesheets/:timesheetId",
    label: "Timesheet Details",
    element: <div>Timesheet Details</div>,
  },
  // --------------------
  // ANALYTICS
  // --------------------
  {
    path: "/analytics",
    label: "Analytics",
    icon: "BarChart3",
    element: <div>Analytics Overview</div>,
    showInSidebar: true,
    sideBarGroup: "Insights",
  },

  // --------------------
  // SETTINGS
  // --------------------
  {
    path: "/settings",
    label: "Settings",
    icon: "Settings",
    element: <SettingsPage />,
    showInSidebar: true,
    sideBarGroup: "System",
  },

  // --------------------
  // SYSTEM ROUTES
  // --------------------
  {
    path: "/unauthorized",
    label: "Unauthorized",
    element: <div>Unauthorized</div>,
    public: true,
  },
  {
    path: "*",
    label: "Not Found",
    element: <div>Not Found</div>,
    public: true,
  },
];
