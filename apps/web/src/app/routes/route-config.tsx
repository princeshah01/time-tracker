import {
  AcceptInvitePage,
  AuthPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "@/features/auth/pages";
import {
  ClientDetailsPage,
  ClientMainPage,
  CreateClientPage,
} from "@/features/client";
import {
  CreateProjectPage,
  ProjectDetailsPage,
  ProjectMainPage,
} from "@/features/project";
import { SettingsPage } from "@/features/settings";
import { CreateTaskPage, TaskDetailsPage, TaskMainPage } from "@/features/task";
import { permissions } from "@/shared/constants";
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
    element: <ClientMainPage />,
    showInSidebar: true,
    sideBarGroup: "Management",
    permissions: [permissions.clientViewAll, permissions.clientViewOwn],
  },
  {
    path: "/clients/new",
    label: "Create Client",
    element: <CreateClientPage />,
    permissions: [permissions.clientCreate],
  },
  {
    path: "/clients/:clientId",
    label: "Client Details",
    element: <ClientDetailsPage />,
    permissions: [permissions.clientViewAll, permissions.clientViewOwn],
  },
  {
    path: "/client",
    label: "Clients",
    element: <ClientMainPage />,
    permissions: [permissions.clientViewAll, permissions.clientViewOwn],
  },
  {
    path: "/client/new",
    label: "Create Client",
    element: <CreateClientPage />,
    permissions: [permissions.clientCreate],
  },
  {
    path: "/client/:clientId",
    label: "Client Details",
    element: <ClientDetailsPage />,
    permissions: [permissions.clientViewAll, permissions.clientViewOwn],
  },
  // --------------------
  // PROJECTS
  // --------------------
  {
    path: "/project",
    label: "Projects",
    icon: "FolderKanban",
    element: <ProjectMainPage />,
    showInSidebar: true,
    sideBarGroup: "Management",
    permissions: [permissions.projectViewAll, permissions.projectViewOwn],
  },
  {
    path: "/project/new",
    label: "Create Project",
    element: <CreateProjectPage />,
    permissions: [permissions.projectCreate],
  },
  {
    path: "/project/:projectId",
    label: "Project Details",
    element: <ProjectDetailsPage />,
    permissions: [permissions.projectViewAll, permissions.projectViewOwn],
  },
  {
    path: "/projects",
    label: "Projects",
    element: <ProjectMainPage />,
    permissions: [permissions.projectViewAll, permissions.projectViewOwn],
  },
  {
    path: "/projects/new",
    label: "Create Project",
    element: <CreateProjectPage />,
    permissions: [permissions.projectCreate],
  },
  {
    path: "/projects/:projectId",
    label: "Project Details",
    element: <ProjectDetailsPage />,
    permissions: [permissions.projectViewAll, permissions.projectViewOwn],
  },
  // --------------------
  // TASKS
  // --------------------
  {
    path: "/tasks",
    label: "Tasks",
    icon: "CheckSquare",
    element: <TaskMainPage />,
    showInSidebar: true,
    sideBarGroup: "Management",
    permissions: [permissions.taskViewAll, permissions.taskViewOwn],
  },
  {
    path: "/tasks/new",
    label: "Create Task",
    element: <CreateTaskPage />,
    permissions: [permissions.taskCreate],
  },
  {
    path: "/tasks/:taskId",
    label: "Edit Task",
    element: <TaskDetailsPage />,
    permissions: [permissions.taskCreate],
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
