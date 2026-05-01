import {
  AcceptInvitePage,
  AuthPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  SignupOtpPage,
  TwoFactorPage,
} from "@/features/auth/pages";
import { ProfileSettingsPage, SecuritySettingsPage } from "@/features/profile";
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
  },
  {
    path: "/accept-invite",
    label: "Accept Invite",
    element: <AcceptInvitePage />,
    public: true,
  },
  {
    path: "/forgot-password",
    label: "Forgot Password",
    element: <ForgotPasswordPage />,
    public: true,
  },
  {
    path: "/reset-password",
    label: "Reset Password",
    element: <ResetPasswordPage />,
    public: true,
  },
  {
    path: "/signup-otp",
    label: "Verify Email",
    element: <SignupOtpPage />,
    public: true,
  },
  {
    path: "/two-factor",
    label: "Two Factor",
    element: <TwoFactorPage />,
    public: true,
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
    permissions: ["client:view"],
    showInSidebar: true,
  },
  {
    path: "/clients/new",
    label: "Create Client",
    icon: "Plus",
    element: <div>Create Client</div>,
    permissions: ["client:create"],
    showInSidebar: false,
  },
  {
    path: "/clients/:clientId",
    label: "Client Details",
    icon: "Users",
    element: <div>Client Details</div>,
    permissions: ["client:view"],
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
    permissions: ["project:view"],
    showInSidebar: true,
  },
  {
    path: "/projects/new",
    label: "Create Project",
    icon: "Plus",
    element: <div>Create Project</div>,
    permissions: ["project:create"],
    showInSidebar: false,
  },
  {
    path: "/projects/:projectId",
    label: "Project Details",
    icon: "FolderKanban",
    element: <div>Project Details</div>,
    permissions: ["project:view"],
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
    permissions: ["timesheet:view:own"],
    showInSidebar: true,
  },
  {
    path: "/timesheets/new",
    label: "Create Timesheet",
    icon: "Plus",
    element: <div>Create Timesheet</div>,
    permissions: ["timesheet:create"],
    showInSidebar: false,
  },
  {
    path: "/timesheets/:timesheetId",
    label: "Timesheet Details",
    icon: "Clock",
    element: <div>Timesheet Details</div>,
    permissions: ["timesheet:view:own"],
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
    element: <ProfileSettingsPage />,
    showInSidebar: true,
  },
  {
    path: "/settings/security",
    label: "Security",
    icon: "Shield",
    element: <SecuritySettingsPage />,
    showInSidebar: false,
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
    public: true,
  },
  {
    path: "*",
    label: "Not Found",
    icon: "SearchX",
    element: <div>Not Found</div>,
    showInSidebar: false,
    public: true,
  },
];
