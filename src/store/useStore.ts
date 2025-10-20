import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  thumbnail_url?: string;
  total_budget?: number;
  total_area?: number;
  co2_footprint?: number;
  created_at: string;
  updated_at: string;
}

interface Room {
  id: string;
  project_id: string;
  name: string;
  room_type: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'office' | 'other';
  width?: number;
  length?: number;
  height?: number;
  area?: number;
  canvas_data?: any;
  created_at: string;
  updated_at: string;
}

interface DesignObject {
  id: string;
  room_id: string;
  name: string;
  object_type?: string;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  color?: string;
  material_id?: string;
  vendor_id?: string;
  price?: number;
  co2_footprint?: number;
  metadata?: any;
}

interface Palette {
  id: string;
  user_id: string;
  project_id?: string;
  name: string;
  colors: { hex: string; name: string; percentage: number }[];
  source_image_url?: string;
  is_public: boolean;
}

interface Store {
  user: User | null;
  setUser: (user: User | null) => void;
  
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  
  currentRoom: Room | null;
  setCurrentRoom: (room: Room | null) => void;
  
  objects: DesignObject[];
  setObjects: (objects: DesignObject[]) => void;
  addObject: (obj: DesignObject) => void;
  updateObject: (id: string, updates: Partial<DesignObject>) => void;
  deleteObject: (id: string) => void;
  
  palettes: Palette[];
  setPalettes: (palettes: Palette[]) => void;
  addPalette: (palette: Palette) => void;
  
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  
  syncQueue: any[];
  addToSyncQueue: (item: any) => void;
  clearSyncQueue: () => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),
  
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),
  
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  updateRoom: (id, updates) =>
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  deleteRoom: (id) =>
    set((state) => ({
      rooms: state.rooms.filter((r) => r.id !== id),
    })),
  
  currentRoom: null,
  setCurrentRoom: (room) => set({ currentRoom: room }),
  
  objects: [],
  setObjects: (objects) => set({ objects }),
  addObject: (obj) => set((state) => ({ objects: [...state.objects, obj] })),
  updateObject: (id, updates) =>
    set((state) => ({
      objects: state.objects.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    })),
  deleteObject: (id) =>
    set((state) => ({
      objects: state.objects.filter((o) => o.id !== id),
    })),
  
  palettes: [],
  setPalettes: (palettes) => set({ palettes }),
  addPalette: (palette) => set((state) => ({ palettes: [...state.palettes, palette] })),
  
  isOnline: navigator.onLine,
  setIsOnline: (online) => set({ isOnline: online }),
  
  syncQueue: [],
  addToSyncQueue: (item) =>
    set((state) => ({ syncQueue: [...state.syncQueue, item] })),
  clearSyncQueue: () => set({ syncQueue: [] }),
}));

// Listen for online/offline events
window.addEventListener('online', () => useStore.getState().setIsOnline(true));
window.addEventListener('offline', () => useStore.getState().setIsOnline(false));