import { type LucideProps } from "lucide-react";

import { ICON_REGISTRY, DEFAULT_ICON } from "@/shared/constants";
import type { AppIconName } from "@/shared/constants";
import { cn } from "@workspace/ui/lib/utils";

type AppIconProps = LucideProps & {
  name?: AppIconName;
};

export function AppIcon({ name, className, ...props }: AppIconProps) {
  const Icon = name ? ICON_REGISTRY[name] : DEFAULT_ICON;

  return <Icon className={cn(className)} {...props} />;
}
