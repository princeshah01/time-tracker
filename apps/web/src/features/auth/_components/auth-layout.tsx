import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Link, useNavigate } from "react-router-dom";

import { AppIcon } from "@/shared/components/app-icon";
import { StackedLogo } from "@/shared/components/stacked-logo";

type AuthLayoutProps = {
  children: React.ReactNode;
  eyebrow?: string;
  description?: string;
};

function AuthLayout({
  children,
  eyebrow,
  description = "Manage work logs, approvals, billing, and project profitability",
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-105 space-y-6 rounded-md border border-border p-8">
        <div className="flex flex-col items-start gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <StackedLogo size={16} />
            <span className="font-bold text-[14px] text-foreground uppercase tracking-[0.08em]">
              TimeTracker
            </span>
          </Link>

          <div className="space-y-1">
            {eyebrow ? (
              <p className="font-medium text-[12px] text-foreground">
                {eyebrow}
              </p>
            ) : null}
            <p className="text-[13px] text-muted-foreground">{description}</p>
          </div>
        </div>

        {children}

        <p className="pt-2 text-left text-[11px] text-muted-foreground">
          (c) {new Date().getFullYear()} TimeTracker. All rights reserved.
        </p>
      </div>
    </div>
  );
}

type AuthDoneStateProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  to?: string;
};

function AuthDoneState({
  title,
  description,
  actionLabel,
  onAction,
  to,
}: AuthDoneStateProps) {
  const navigate = useNavigate();

  function handleAction() {
    if (onAction) {
      onAction();
      return;
    }

    if (to) {
      navigate(to);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-md border border-border bg-muted/30 p-4">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background">
          <AppIcon
            name="CheckCircle2"
            className="size-4 text-primary"
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0 space-y-1">
          <h1 className="font-medium text-[14px] text-foreground">{title}</h1>
          <p className="text-[13px] text-muted-foreground">{description}</p>
        </div>
      </div>

      <Button
        type="button"
        className="h-9 w-full text-[13px]"
        onClick={handleAction}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

type AuthPageLinkProps = React.ComponentProps<typeof Link>;

function AuthPageLink({ className, ...props }: AuthPageLinkProps) {
  return (
    <Button asChild className="h-9 w-full text-[13px]">
      <Link className={cn(className)} {...props} />
    </Button>
  );
}

export { AuthDoneState, AuthLayout, AuthPageLink };
