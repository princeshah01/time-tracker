import * as React from "react";
import { cn } from "../lib/utils";

type InputVariant = "default" | "search";

type InputProps = React.ComponentProps<"input"> & {
  variant?: InputVariant;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const baseStyles =
      "flex w-full px-3 py-2 text-base md:text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50";

    const variants: Record<InputVariant, string> = {
      default:
        "h-10 rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      search:
        "h-8 rounded-md border border-border bg-transparent shadow-none px-3 text-[13px] outline-none focus-visible:ring-1 focus-visible:ring-muted-foreground/20 focus-visible:border-muted-foreground/40",
    };
    return (
      <input
        type={type}
        className={cn(
          baseStyles,
          variants[variant],
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "aria-invalid:border-destructive aria-invalid:ring-destructive",
          "aria-invalid:focus-visible:ring-destructive aria-invalid:bg-destructive/5",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };