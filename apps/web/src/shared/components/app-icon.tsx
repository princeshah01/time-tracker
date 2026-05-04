import { Suspense } from "react";
import { Loader, type LucideProps } from "lucide-react";

import { DEFAULT_ICON, ICON_REGISTRY } from "@/shared/constants";
import type { AppIconName } from "@/shared/types";
import { cn } from "@workspace/ui/lib/utils";

type AppIconProps = LucideProps & {
  name?: AppIconName;
};

function isAppIconName(name?: string): name is AppIconName {
  return Boolean(name && name in ICON_REGISTRY);
}

export function AppIcon({
  name,
  className,
  size = 18,
  ...props
}: AppIconProps) {
  const Icon = isAppIconName(name) ? ICON_REGISTRY[name] : DEFAULT_ICON;

  return (
    <Suspense
      fallback={
        <Loader
          className={cn("animate-spin text-slate-400", className)}
          size={size}
          {...props}
        />
      }
    >
      <Icon className={className} size={size} {...props} />
    </Suspense>
  );
}
