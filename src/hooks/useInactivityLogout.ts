import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface UseInactivityLogoutOptions {
  enabled?: boolean;
  inactivityDays?: number; // default 7 days
}

const STORAGE_KEY = 'lastActivityAt';

export function useInactivityLogout(options: UseInactivityLogoutOptions = {}) {
  const { enabled = true, inactivityDays = 7 } = options;
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const signingOutRef = useRef(false);

  useEffect(() => {
    if (!enabled || !user) return;

    const INACTIVITY_MS = inactivityDays * 24 * 60 * 60 * 1000;

    const updateActivity = () => {
      try {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      } catch (e) {
        // ignore storage errors
      }
    };

    const checkInactivity = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const last = raw ? Number(raw) : 0;
        const now = Date.now();

        if (!last) {
          // Initialize on first run for existing sessions
          updateActivity();
          return;
        }

        if (now - last > INACTIVITY_MS) {
          // Exceeded allowed inactivity window
          triggerAutoSignOut();
        }
      } catch (e) {
        // If storage unavailable, do nothing
      }
    };

    const triggerAutoSignOut = () => {
      if (signingOutRef.current) return;
      signingOutRef.current = true;

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}

      // Mark that this was an automatic inactivity logout to avoid duplicate toasts
      try {
        sessionStorage.setItem('autoSignedOut', '1');
      } catch {}

      // Perform sign out then navigate
      void (async () => {
        try {
          await signOut();
        } finally {
          toast({
            title: 'Signed out for inactivity',
            description: `You were signed out due to ${inactivityDays} days of inactivity.`,
            variant: 'destructive',
            duration: 6000,
          });
          navigate('/auth');
        }
      })();
    };

    // Activity events
    const activityEvents: (keyof DocumentEventMap | keyof WindowEventMap)[] = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart',
    ];

    const onActivity = () => updateActivity();

    activityEvents.forEach((evt) => window.addEventListener(evt as any, onActivity, { passive: true }));

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        updateActivity();
        checkInactivity();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Initial check on mount (does not count as activity)
    checkInactivity();

    // Periodic checks while the app is open
    const interval = window.setInterval(checkInactivity, 60 * 1000); // every 60s

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt as any, onActivity));
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearInterval(interval);
    };
  }, [enabled, inactivityDays, user, signOut, navigate]);
}

export default useInactivityLogout;
