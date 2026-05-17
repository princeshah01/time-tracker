import { AppIcon } from "@/shared/components/app-icon";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
  };
};

type ThemeToggleProps = {
  className?: string;
  duration?: number;
};

function ThemeToggle({ className, duration = 1000 }: ThemeToggleProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  const handleToggle = useCallback(async () => {
    if (!buttonRef.current) return;

    const viewTransitionDocument = document as ViewTransitionDocument;
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const originX = buttonRect.left + buttonRect.width / 2;
    const originY = buttonRect.top + buttonRect.height / 2;
    const endRadius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY)
    );

    if (!viewTransitionDocument.startViewTransition) {
      toggleTheme();
      return;
    }

    const transition = viewTransitionDocument.startViewTransition(() => {
      flushSync(toggleTheme);
    });

    await transition.ready;

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${originX}px ${originY}px)`,
          `circle(${endRadius}px at ${originX}px ${originY}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }, [duration, toggleTheme]);

  return (
    <Button
      ref={buttonRef}
      type="button"
      noStyle
      className={cn("opacity-70 hover:opacity-100", className)}
      title="Toggle theme"
      disabled={!mounted}
      aria-label="Toggle theme"
      onClick={() => void handleToggle()}
    >
      {mounted ? (
        <AppIcon name={isDark ? "Sun" : "Moon"} className="size-5" />
      ) : (
        <span className="block size-4" aria-hidden="true" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export { ThemeToggle };
