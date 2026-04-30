import { AuthPage } from "@/features/auth/page";
import type { AppRoute } from "@/shared/types";

export const appRoutes: AppRoute[] = [
  // --------------------
  // AUTH ROUTES
  // --------------------
  {
    path: "/auth",
    label: "Auth",
    element: <AuthPage />,
  },
  {
    path: "/accept-invite",
    label: "Accept Invite",
    element: <div>Accept Invite Page</div>,
  },
  {
    path: "/forgot-password",
    label: "Forgot Password",
    element: <div>Forgot Password Page</div>,
  },
  {
    path: "/reset-password",
    label: "Reset Password",
    element: <div>Reset Password Page</div>,
  },

  // --------------------
  // DASHBOARD
  // --------------------
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: "Home",
    element: <div>Dashboard Overview</div>,
    showInSidebar: true,
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
  },
  {
    path: "/clients/new",
    label: "Create Client",
    icon: "Plus",
    element: <div>Create Client</div>,
    showInSidebar: false,
  },
  {
    path: "/clients/:clientId",
    label: "Client Details",
    icon: "Users",
    element: <div>Client Details</div>,
    showInSidebar: false,
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
  },
  {
    path: "/projects/new",
    label: "Create Project",
    icon: "Plus",
    element: <div>Create Project</div>,
    showInSidebar: false,
  },
  {
    path: "/projects/:projectId",
    label: "Project Details",
    icon: "FolderKanban",
    element: <div>Project Details</div>,
    showInSidebar: false,
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
  },
  {
    path: "/tasks/new",
    label: "Create Task",
    icon: "Plus",
    element: <div>Create Task</div>,
    showInSidebar: false,
  },
  {
    path: "/tasks/:taskId",
    label: "Task Details",
    icon: "CheckSquare",
    element: <div>Task Details</div>,
    showInSidebar: false,
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
  },
  {
    path: "/timesheets/new",
    label: "Create Timesheet",
    icon: "Plus",
    element: <div>Create Timesheet</div>,
    showInSidebar: false,
  },
  {
    path: "/timesheets/:timesheetId",
    label: "Timesheet Details",
    icon: "Clock",
    element: <div>Timesheet Details</div>,
    showInSidebar: false,
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
  },

  // --------------------
  // SETTINGS
  // --------------------
  {
    path: "/settings",
    label: "Settings",
    icon: "Settings",
    element: <div>Settings Overview</div>,
    showInSidebar: true,
  },

  // --------------------
  // SYSTEM ROUTES
  // --------------------
  {
    path: "/unauthorized",
    label: "Unauthorized",
    icon: "ShieldAlert",
    element: <div>Unauthorized</div>,
    showInSidebar: false,
  },
  {
    path: "*",
    label: "Not Found",
    icon: "SearchX",
    element: <div>Not Found</div>,
    showInSidebar: false,
  },
];
