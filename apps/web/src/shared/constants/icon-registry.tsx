import type { ComponentType, SVGProps } from "react";
import { lazy } from "react";

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

export const ICON_REGISTRY: Record<string, SvgIcon> = {
  FileSearch: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.FileSearch }))
  ),

  Target: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.Target }))
  ),
  Loader: lazy(() =>
    import("lucide-react").then((m) => ({ default: m.Loader }))
  ),
};

export const DEFAULT_ICON: SvgIcon = lazy(() =>
  import("lucide-react").then((m) => ({ default: m.HelpCircle }))
);

export type IconName = keyof typeof ICON_REGISTRY;
