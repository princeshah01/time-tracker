import { Button } from "@workspace/ui/components/button";
import { useEffect, useState } from "react";

type ResendCountdownButtonProps = {
  onResend: () => Promise<void> | void;
  seconds?: number;
  idleLabel?: string;
  waitingLabelPrefix?: string;
  className?: string;
};

function ResendCountdownButton({
  onResend,
  seconds = 30,
  idleLabel = "Resend OTP",
  waitingLabelPrefix = "Resend in",
  className,
}: ResendCountdownButtonProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (remaining <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [remaining]);

  async function handleResend() {
    if (remaining > 0 || isResending) {
      return;
    }

    setIsResending(true);
    await onResend();
    setRemaining(seconds);
    setIsResending(false);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className={className ?? "h-9 w-full text-[12px] text-muted-foreground"}
      onClick={handleResend}
      disabled={remaining > 0 || isResending}
    >
      {isResending
        ? "Resending..."
        : remaining > 0
          ? `${waitingLabelPrefix} ${remaining}s`
          : idleLabel}
    </Button>
  );
}

export { ResendCountdownButton };
export type { ResendCountdownButtonProps };
