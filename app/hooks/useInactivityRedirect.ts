import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const INACTIVITY_TIMEOUT = 2 * 15 * 1000; // 2 minutes

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "wheel",
  "touchstart",
  "touchmove",
  "click",
] as const;

export function useInactivityRedirect(redirectTo = "/", enabled = true) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        router.push(redirectTo);
      }, INACTIVITY_TIMEOUT);
    };

    reset();

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, reset, { passive: true })
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, reset)
      );
    };
  }, [router, redirectTo, enabled]);
}
