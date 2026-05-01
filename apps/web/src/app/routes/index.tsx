import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import { ProtectedRoute } from "./protected-route";
import { appRoutes } from "./route-config";

function mapRoutes(routes: typeof appRoutes) {
  return routes.flatMap((route) => {
    const parentRoute = {
      path: route.path,
      element: route.public ? (
        route.element
      ) : (
        <ProtectedRoute requiredPermissions={route.permissions}>
          {route.element}
        </ProtectedRoute>
      ),
    };

    const childRoutes =
      route.children?.map((child) => ({
        path: child.path,
        element: child.public ? (
          child.element
        ) : (
          <ProtectedRoute requiredPermissions={child.permissions}>
            {child.element}
          </ProtectedRoute>
        ),
      })) ?? [];

    return [parentRoute, ...childRoutes];
  });
}

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
        ...mapRoutes(appRoutes),
        {
          path: "/unauthorized",
          element: (
            <div>
              Unauthorized - You do not have permission to view this page.
            </div>
          ),
        },
      ],
    },
  ]);
}
