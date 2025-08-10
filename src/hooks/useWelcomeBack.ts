import { useEffect } from "react";

interface WelcomeBackOptions {
  cooldownHours?: number; // minimum hours between welcomes after first session show
  minAwayMinutes?: number; // minimum minutes away to count as a return
  enableBrowserNotification?: boolean; // also show a system notification if allowed
}

// Detects when the user returns to the tab/app and triggers a callback with sensible rate limits.
// Behavior:
// - Shows once per browser session immediately (on first mount/visit)
// - Afterwards, only shows again if the user was away >= minAwayMinutes and last welcome was >= cooldownHours ago
export function useWelcomeBack(
  onWelcome: () => void,
  options: WelcomeBackOptions = {}
) {
  const {
    cooldownHours = 6,
    minAwayMinutes = 10,
    enableBrowserNotification = false,
  } = options;

  useEffect(() => {
    const LAST_HIDDEN_KEY = "wb_last_hidden_at";
    const LAST_WELCOME_KEY = "wb_last_welcome_at";
    const SESSION_SHOWN_KEY = "wb_session_welcome_shown";

    const now = () => Date.now();

    const markHidden = () => {
      try {
        localStorage.setItem(LAST_HIDDEN_KEY, String(now()));
      } catch {}
    };

    const triggerWelcome = (reason: string) => {
      try {
        localStorage.setItem(LAST_WELCOME_KEY, String(now()));
        sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
      } catch {}

      onWelcome();

      if (
        enableBrowserNotification &&
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification("Welcome back!", {
            body: "Glad to see you again.",
            icon: "/favicon.ico",
            tag: "welcome-back",
          });
        } catch {}
      }
    };

    const canShow = () => {
      try {
        const sessionShown = sessionStorage.getItem(SESSION_SHOWN_KEY) === "true";
        if (!sessionShown) return true; // first time this session

        const lastHiddenAt = Number(localStorage.getItem(LAST_HIDDEN_KEY) || 0);
        const lastWelcomeAt = Number(localStorage.getItem(LAST_WELCOME_KEY) || 0);

        const awayMs = now() - lastHiddenAt;
        const sinceWelcomeMs = now() - lastWelcomeAt;

        const MIN_AWAY = minAwayMinutes * 60 * 1000;
        const COOLDOWN = cooldownHours * 60 * 60 * 1000;

        return awayMs >= MIN_AWAY && sinceWelcomeMs >= COOLDOWN;
      } catch {
        return false;
      }
    };

    const maybeWelcome = (reason: string) => {
      if (canShow()) {
        triggerWelcome(reason);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        markHidden();
      } else if (document.visibilityState === "visible") {
        maybeWelcome("visibility");
      }
    };

    const handleFocus = () => {
      maybeWelcome("focus");
    };

    // Initial attempt: show once per session on first load
    maybeWelcome("mount");

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [onWelcome, cooldownHours, minAwayMinutes, enableBrowserNotification]);
}
