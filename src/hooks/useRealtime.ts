import { useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, setupRealtimeSubscription } from '@services/supabase';
import { useStore } from '@store/useStore';

/**
 * Hook to manage realtime subscriptions for a project
 */
export function useRealtime(projectId: string | null) {
  const { setProjects, setRooms, setObjects } = useStore();

  useEffect(() => {
    if (!projectId) return;

    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      channel = setupRealtimeSubscription(projectId, {
        onProjectUpdate: (payload) => {
          if (payload.eventType === 'UPDATE') {
            setProjects((projects) =>
              projects.map((p) =>
                p.id === payload.new.id ? { ...p, ...payload.new } : p
              )
            );
          }
        },
        onRoomUpdate: (payload) => {
          if (payload.eventType === 'INSERT') {
            setRooms((rooms) => [...rooms, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setRooms((rooms) =>
              rooms.map((r) => (r.id === payload.new.id ? { ...r, ...payload.new } : r))
            );
          } else if (payload.eventType === 'DELETE') {
            setRooms((rooms) => rooms.filter((r) => r.id !== payload.old.id));
          }
        },
        onObjectUpdate: (payload) => {
          if (payload.eventType === 'INSERT') {
            setObjects((objects) => [...objects, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setObjects((objects) =>
              objects.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o))
            );
          } else if (payload.eventType === 'DELETE') {
            setObjects((objects) => objects.filter((o) => o.id !== payload.old.id));
          }
        },
      });
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [projectId, setProjects, setRooms, setObjects]);
}