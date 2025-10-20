import { useState, useEffect } from 'react';
import { useStore } from '@store/useStore';
import { syncOfflineData } from '@services/supabase';

/**
 * Hook to track online/offline status and trigger sync
 */
export function useOnline() {
  const { isOnline, setIsOnline } = useStore();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      
      // Attempt to sync offline changes
      try {
        setSyncing(true);
        await syncOfflineData();
      } catch (error) {
        console.error('Failed to sync offline data:', error);
      } finally {
        setSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Set initial state
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  return { isOnline, syncing };
}