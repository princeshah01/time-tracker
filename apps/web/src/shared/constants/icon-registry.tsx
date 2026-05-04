import { lazy } from "react";
import type { ComponentType, SVGProps } from "react";

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

export const ICON_REGISTRY = {
  Home: lazy(() => import("lucide-react").then((m) => ({ default: m.Home }))),
  Users: lazy(() => import("lucide-react").then((m) => ({ default: m.Users }))),
  FolderKanban: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.FolderKanban }))
  ),
  CheckSquare: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.CheckSquare }))
  ),
  Clock: lazy(() => import("lucide-react").then((m) => ({ default: m.Clock }))),
  BarChart3: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.BarChart3 }))
  ),
  Settings: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.Settings }))
  ),

  Mail: lazy(() => import("lucide-react").then((m) => ({ default: m.Mail }))),
  Loader: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.Loader }))
  ),
  LogOut: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.LogOut }))
  ),

  LayoutDashboard: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.LayoutDashboard }))
  ),

  HelpCircle: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.HelpCircle }))
  ),
} as const satisfies Record<string, SvgIcon>;

export type IconName = keyof typeof ICON_REGISTRY;

// --------------------
// DEFAULT ICON
// --------------------
export const DEFAULT_ICON: SvgIcon = ICON_REGISTRY.HelpCircle;
