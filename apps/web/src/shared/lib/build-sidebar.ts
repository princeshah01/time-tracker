import { appRoutes } from "@/app/routes/route-config";
import { hasPermission } from "@/shared/lib/permissions";
import type { AppRoute, SidebarGroupKey } from "@/shared/types";
import { SIDEBAR_GROUPS } from "@/shared/constants";
type SideBarItem = {
  icon: AppRoute["icon"];
  label: string;
  path: string;
};

export type SidebarGroupMap = Record<SidebarGroupKey, SideBarItem[]>;

function createEmptySidebarGroups(): SidebarGroupMap {
  const groups = {} as SidebarGroupMap;

  for (const group of SIDEBAR_GROUPS) {
    groups[group] = [];
  }

  return groups;
}

export function buildSidebarRoutes(
  userPermissions: string[] = []
): SidebarGroupMap {
  const groups = createEmptySidebarGroups();

  for (const route of appRoutes) {
    if (!route.showInSidebar) continue;

    const requiredPermissions = route.permissions ?? [];

    if (!hasPermission(userPermissions, requiredPermissions)) {
      continue;
    }

    const group = route.sideBarGroup ?? "General";

    groups[group].push({
      icon: route.icon,
      label: route.label,
      path: route.path,
    });
  }

  return groups;
}
