import { ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";

type RootProps = {
  children: ReactNode;
  className?: string;
};

function Root({ children, className }: RootProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full overflow-hidden", // ✅ important
        className
      )}
    >
      {children}
    </div>
  );
}

type HeaderProps = {
  title?: string;
  children?: ReactNode;
  className?: string;
};

function Header({ title, children, className }: HeaderProps) {
  return (
    <div
      className={cn(
        "px-4 md:px-6 h-11 border-b border-border flex items-center justify-between shrink-0 bg-background",
        className
      )}
    >
      <h1 className="text-[13px] tracking-wider font-medium">{title}</h1>

      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

type ActionsProps = {
  children: ReactNode;
  className?: string;
};

function Actions({ children, className }: ActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>{children}</div>
  );
}

type BodyProps = {
  children: ReactNode;
  className?: string;
};

function Body({ children, className }: BodyProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto min-h-0", // ✅ critical fix
        className
      )}
    >
      {children}
    </div>
  );
}

export const PageContent = {
  Root,
  Header,
  Actions,
  Body,
};
