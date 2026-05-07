import { useEffect, useRef } from "react";

type UseDismissOptions = {
  enabled?: boolean;
  onDismiss: () => void;
  closeOnScroll?: boolean;
  closeOnEscape?: boolean;
};

function useDismiss<T extends HTMLElement>({
  enabled = true,
  onDismiss,
  closeOnScroll = true,
  closeOnEscape = true,
}: UseDismissOptions) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        onDismiss();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onDismiss();
      }
    }

    function handleScroll() {
      onDismiss();
    }

    window.addEventListener("mousedown", handleClickOutside);

    if (closeOnEscape) {
      window.addEventListener("keydown", handleEscape);
    }

    if (closeOnScroll) {
      window.addEventListener("scroll", handleScroll, true);
    }

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);

      if (closeOnEscape) {
        window.removeEventListener("keydown", handleEscape);
      }

      if (closeOnScroll) {
        window.removeEventListener("scroll", handleScroll, true);
      }
    };
  }, [enabled, onDismiss, closeOnEscape, closeOnScroll]);

  return ref;
}

export { useDismiss };