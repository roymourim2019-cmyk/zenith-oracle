import { useState, useEffect, useCallback } from 'react';

const PROFILE_KEY = 'zenith_user_profile';
const STREAK_KEY = 'zenith_streak';
const READINGS_KEY = 'zenith_readings_count';
const ONBOARDED_KEY = 'zenith_onboarded';

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      try { setProfile(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveProfile = useCallback((data) => {
    const p = { ...data, updated_at: new Date().toISOString() };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    setProfile(p);
  }, []);

  const isOnboarded = !!localStorage.getItem(ONBOARDED_KEY);
  const markOnboarded = () => localStorage.setItem(ONBOARDED_KEY, 'true');

  return { profile, saveProfile, isOnboarded, markOnboarded };
};

export const useStreak = () => {
  const [streak, setStreak] = useState({ count: 0, lastDate: null, best: 0 });

  useEffect(() => {
    const saved = localStorage.getItem(STREAK_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (data.lastDate === today) {
          setStreak(data);
        } else if (data.lastDate === yesterday) {
          setStreak(data);
        } else {
          setStreak({ count: 0, lastDate: null, best: data.best || 0 });
        }
      } catch (e) {}
    }
  }, []);

  const recordVisit = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setStreak(prev => {
      if (prev.lastDate === today) return prev;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newCount = prev.lastDate === yesterday ? prev.count + 1 : 1;
      const newBest = Math.max(newCount, prev.best || 0);
      const updated = { count: newCount, lastDate: today, best: newBest };
      localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { streak, recordVisit };
};

export const useReadingsCount = () => {
  const getCount = () => parseInt(localStorage.getItem(READINGS_KEY) || '0', 10);
  const [count, setCount] = useState(getCount);

  const increment = useCallback(() => {
    const newCount = getCount() + 1;
    localStorage.setItem(READINGS_KEY, newCount.toString());
    setCount(newCount);
  }, []);

  return { readingsCount: count, incrementReadings: increment };
};

export const useRatingPrompt = () => {
  const [shouldShow, setShouldShow] = useState(false);
  const RATING_KEY = 'zenith_rating_prompted';
  const READING_THRESHOLD = 5;

  const checkRating = useCallback(() => {
    const prompted = localStorage.getItem(RATING_KEY);
    if (prompted) return;
    const count = parseInt(localStorage.getItem(READINGS_KEY) || '0', 10);
    if (count >= READING_THRESHOLD) {
      setShouldShow(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(RATING_KEY, 'true');
    setShouldShow(false);
  };

  return { shouldShowRating: shouldShow, checkRating, dismissRating: dismiss };
};

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const DISMISSED_KEY = 'zenith_install_dismissed';

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
    return result.outcome;
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setCanInstall(false);
  };

  return { canInstall, install, dismissInstall: dismiss };
};
