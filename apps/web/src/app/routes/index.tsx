import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import { GuestRoute } from "./guest-route";
import { ProtectedRoute } from "./protected-route";
import { appRoutes } from "./route-config";
import { AppLayout } from "@/shared/components/app-layout";

function createRoute(route: (typeof appRoutes)[number]) {
  return {
    path: route.path,
    element: route.guestOnly ? (
      <GuestRoute>{route.element}</GuestRoute>
    ) : route.public ? (
      route.element
    ) : (
      <ProtectedRoute requiredPermissions={route.permissions}>
        {route.element}
      </ProtectedRoute>
    ),
  };
}

const publicRoutes = appRoutes
  .filter((route) => route.public || route.guestOnly)
  .map(createRoute);

const protectedRoutes = appRoutes
  .filter((route) => !route.public && !route.guestOnly)
  .map((route) => ({
    path: route.path,
    element: (
      <ProtectedRoute requiredPermissions={route.permissions}>
        {route.element}
      </ProtectedRoute>
    ),
  }));

export function createAppRouter() {
  return createBrowserRouter([
    {
      path: "/",
      element: <Outlet />,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />,
        },

        ...publicRoutes,

        {
          element: (
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          ),
          children: protectedRoutes,
        },
      ],
    },
  ]);
}
