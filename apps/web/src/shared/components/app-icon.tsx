import { DEFAULT_ICON, ICON_REGISTRY } from "@/shared/constants";
import { cn } from "@workspace/ui/lib/utils";
import type { AppIconName } from "@/shared/types";
import { Loader, type LucideIcon, type LucideProps } from "lucide-react";
import { Suspense } from "react";

type AppIconProps = LucideProps & {
  name?: AppIconName | string;
};

export function AppIcon({
  name = "HelpCircle",
  className,
  ...props
}: AppIconProps) {
  const Icon = (
    name && name in ICON_REGISTRY
      ? ICON_REGISTRY[name as keyof typeof ICON_REGISTRY]
      : DEFAULT_ICON
  ) as LucideIcon;

  return (
    <Suspense
      fallback={
        <Loader
          className={cn("animate-spin text-slate-400", className)}
          size={props.size ?? 18}
          {...props}
        />
      }
    >
      <Icon className={className} {...props} />
    </Suspense>
  );
}
