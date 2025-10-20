import { createClient } from '@supabase/supabase-js';
import { openDB, DBSchema } from 'idb';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// IndexedDB schema for offline storage
interface OfflineDB extends DBSchema {
  projects: {
    key: string;
    value: any;
  };
  rooms: {
    key: string;
    value: any;
    indexes: { 'by-project': string };
  };
  objects: {
    key: string;
    value: any;
    indexes: { 'by-room': string };
  };
  palettes: {
    key: string;
    value: any;
  };
  sync_queue: {
    key: number;
    value: {
      id: number;
      table: string;
      operation: 'insert' | 'update' | 'delete';
      data: any;
      timestamp: number;
    };
  };
}

// Initialize IndexedDB
export const initDB = async () => {
  return openDB<OfflineDB>('interior-systems-db', 1, {
    upgrade(db) {
      // Projects store
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }

      // Rooms store
      if (!db.objectStoreNames.contains('rooms')) {
        const roomStore = db.createObjectStore('rooms', { keyPath: 'id' });
        roomStore.createIndex('by-project', 'project_id');
      }

      // Objects store
      if (!db.objectStoreNames.contains('objects')) {
        const objectStore = db.createObjectStore('objects', { keyPath: 'id' });
        objectStore.createIndex('by-room', 'room_id');
      }

      // Palettes store
      if (!db.objectStoreNames.contains('palettes')) {
        db.createObjectStore('palettes', { keyPath: 'id' });
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

// Offline cache operations
export const offlineCache = {
  async getProjects() {
    const db = await initDB();
    return db.getAll('projects');
  },

  async saveProject(project: any) {
    const db = await initDB();
    await db.put('projects', project);
  },

  async deleteProject(id: string) {
    const db = await initDB();
    await db.delete('projects', id);
  },

  async getRooms(projectId?: string) {
    const db = await initDB();
    if (projectId) {
      return db.getAllFromIndex('rooms', 'by-project', projectId);
    }
    return db.getAll('rooms');
  },

  async saveRoom(room: any) {
    const db = await initDB();
    await db.put('rooms', room);
  },

  async getObjects(roomId?: string) {
    const db = await initDB();
    if (roomId) {
      return db.getAllFromIndex('objects', 'by-room', roomId);
    }
    return db.getAll('objects');
  },

  async saveObject(obj: any) {
    const db = await initDB();
    await db.put('objects', obj);
  },

  async addToSyncQueue(table: string, operation: 'insert' | 'update' | 'delete', data: any) {
    const db = await initDB();
    await db.add('sync_queue', {
      table,
      operation,
      data,
      timestamp: Date.now(),
    } as any);
  },

  async getSyncQueue() {
    const db = await initDB();
    return db.getAll('sync_queue');
  },

  async clearSyncQueue() {
    const db = await initDB();
    await db.clear('sync_queue');
  },
};

// Sync operations when coming back online
export const syncOfflineData = async () => {
  const queue = await offlineCache.getSyncQueue();
  const session = await supabase.auth.getSession();

  if (!session.data.session) {
    console.error('No active session for sync');
    return;
  }

  for (const item of queue) {
    try {
      switch (item.operation) {
        case 'insert':
          await supabase.from(item.table).insert(item.data);
          break;
        case 'update':
          await supabase.from(item.table).update(item.data).eq('id', item.data.id);
          break;
        case 'delete':
          await supabase.from(item.table).delete().eq('id', item.data.id);
          break;
      }
    } catch (error) {
      console.error('Sync error:', error);
      // Keep item in queue if sync fails
      continue;
    }
  }

  // Clear queue after successful sync
  await offlineCache.clearSyncQueue();
};

// Realtime subscriptions setup
export const setupRealtimeSubscription = (projectId: string, callbacks: {
  onProjectUpdate?: (payload: any) => void;
  onRoomUpdate?: (payload: any) => void;
  onObjectUpdate?: (payload: any) => void;
}) => {
  const channel = supabase
    .channel(`project:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`,
      },
      (payload) => callbacks.onProjectUpdate?.(payload)
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => callbacks.onRoomUpdate?.(payload)
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'objects',
      },
      (payload) => callbacks.onObjectUpdate?.(payload)
    )
    .subscribe();

  return channel;
};

// API wrapper with offline fallback
export const api = {
  async getProjects() {
    if (!navigator.onLine) {
      return offlineCache.getProjects();
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Cache projects offline
    for (const project of data) {
      await offlineCache.saveProject(project);
    }

    return data;
  },

  async createProject(project: any) {
    if (!navigator.onLine) {
      const tempId = `temp_${Date.now()}`;
      const offlineProject = { ...project, id: tempId };
      await offlineCache.saveProject(offlineProject);
      await offlineCache.addToSyncQueue('projects', 'insert', project);
      return offlineProject;
    }

    const { data, error } = await supabase.from('projects').insert(project).select().single();

    if (error) throw error;
    await offlineCache.saveProject(data);
    return data;
  },

  async updateProject(id: string, updates: any) {
    if (!navigator.onLine) {
      await offlineCache.addToSyncQueue('projects', 'update', { id, ...updates });
      return { id, ...updates };
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await offlineCache.saveProject(data);
    return data;
  },

  async deleteProject(id: string) {
    if (!navigator.onLine) {
      await offlineCache.deleteProject(id);
      await offlineCache.addToSyncQueue('projects', 'delete', { id });
      return;
    }

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    await offlineCache.deleteProject(id);
  },
};