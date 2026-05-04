import type { ComponentType, SVGProps } from "react";
import { lazy } from "react";

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
  CheckCircle2: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.CheckCircle2 }))
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
  Shield: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.Shield }))
  ),
  Bell: lazy(() => import("lucide-react").then((m) => ({ default: m.Bell }))),
  Building2: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.Building2 }))
  ),
  Lock: lazy(() => import("lucide-react").then((m) => ({ default: m.Lock }))),
  User: lazy(() => import("lucide-react").then((m) => ({ default: m.User }))),
  Camera: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.Camera }))
  ),
  Search: lazy(() => import("lucide-react").then((m) => ({ default: m.Search }))),
  Plus: lazy(() => import("lucide-react").then((m) => ({ default: m.Plus }))),
  HelpCircle: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.HelpCircle }))
  ),
} as const satisfies Record<string, SvgIcon>;

export type IconName = keyof typeof ICON_REGISTRY;

// --------------------
// DEFAULT ICON
// --------------------
export const DEFAULT_ICON: SvgIcon = ICON_REGISTRY.HelpCircle;
