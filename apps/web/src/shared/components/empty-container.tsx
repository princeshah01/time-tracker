import { AppIcon } from "@/shared/components/app-icon";
import { cn } from "@workspace/ui/lib/utils";

type EmptyStateSize = "xs" | "sm" | "md" | "lg";

type EmptyStateProps = {
  text?: string;
  size?: EmptyStateSize;
  containerClassName?: string;
};

const sizeClassName: Record<EmptyStateSize, string> = {
  xs: "py-2 text-[11px] [&_svg]:size-4",
  sm: "py-3 text-[12px] [&_svg]:size-5",
  md: "py-6 text-sm [&_svg]:size-8",
  lg: "py-10 text-base [&_svg]:size-10",
};

export function EmptyState({
  text = "No data found",
  size = "md",
  containerClassName,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-muted-foreground",
        sizeClassName[size],
        containerClassName
      )}
    >
      <AppIcon name="Inbox" />
      <span>{text}</span>
    </div>
  );
}