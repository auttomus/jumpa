import { atom } from 'nanostores';
import type { Venue, JumpaSession, SessionStatus } from '../types';

// Global state atoms (No $ prefix to avoid Svelte syntax errors)
export const mapCenter = atom<readonly [number, number]>([106.8272, -6.1751]); // Default to Central Jakarta (Monas)
export const mapZoom = atom<number>(12);
export const isChatOpen = atom<boolean>(false);
export const blackholeOrigin = atom<{ x: number; y: number }>({ x: 0, y: 0 });
export const activeSession = atom<JumpaSession | null>(null);

// Selected venue / active marker
export const selectedVenue = atom<Venue | null>(null);

// Map theme mode: auto (time-based), day, night, sunset
export type MapThemeMode = 'auto' | 'day' | 'night' | 'sunset';
export const mapTheme = atom<MapThemeMode>('auto');

export function setMapTheme(mode: MapThemeMode) {
  mapTheme.set(mode);
}

// Synchronize mapTheme state with HTML root element data-theme attribute
if (typeof document !== 'undefined') {
  mapTheme.subscribe((theme) => {
    let activeTheme = theme;
    if (theme === 'auto') {
      const hour = new Date().getHours();
      if (hour >= 20 || hour < 5) activeTheme = 'night';
      else if (hour >= 5 && hour < 8) activeTheme = 'sunrise';
      else if (hour >= 8 && hour < 17) activeTheme = 'day';
      else activeTheme = 'sunset';
    }
    document.documentElement.setAttribute('data-theme', activeTheme);
  });
}

// Sample venues around Jakarta
export const venues = atom<readonly Venue[]>([
  {
    id: 'venue-1',
    name: 'Giyanti Coffee Roastery',
    category: 'Coffee Shop',
    coordinates: [106.8402, -6.1895],
    address: 'Jl. Surabaya No.20, Menteng',
    weight: 4.8,
  },
  {
    id: 'venue-2',
    name: 'Kopi Toko Djawa (Menteng)',
    category: 'Coffee Shop',
    coordinates: [106.8245, -6.1852],
    address: 'Jl. Johar No.34, Menteng',
    weight: 4.6,
  },
  {
    id: 'venue-3',
    name: 'SCBD Common Ground',
    category: 'Coworking Space',
    coordinates: [106.8095, -6.2244],
    address: 'Sudirman Central Business District',
    weight: 4.7,
  },
  {
    id: 'venue-4',
    name: 'Gelora Bung Karno Park',
    category: 'Green Park',
    coordinates: [106.8016, -6.2184],
    address: 'Jl. Jenderal Sudirman, Senayan',
    weight: 4.9,
  },
  {
    id: 'venue-5',
    name: 'Senopati Culinary Hub',
    category: 'Restaurant',
    coordinates: [106.8078, -6.2281],
    address: 'Jl. Senopati, Kebayoran Baru',
    weight: 4.5,
  }
]);

// Helper functions to mutate state
export function setMapCenter(lng: number, lat: number) {
  mapCenter.set([lng, lat]);
}

export function setMapZoom(zoomVal: number) {
  mapZoom.set(zoomVal);
}

export function toggleChat(open?: boolean) {
  const current = isChatOpen.get();
  isChatOpen.set(open !== undefined ? open : !current);
}

export function setBlackholeOrigin(x: number, y: number) {
  blackholeOrigin.set({ x, y });
}

export function startSession(name: string, destination: readonly [number, number]) {
  activeSession.set({
    id: `session-${Math.random().toString(36).substr(2, 9)}`,
    name,
    status: 'DISCOVERY',
    destination,
  });
}

export function updateSessionStatus(status: SessionStatus) {
  const current = activeSession.get();
  if (current) {
    activeSession.set({ ...current, status });
  }
}

export function selectVenue(venue: Venue | null) {
  selectedVenue.set(venue);
  if (venue) {
    setMapCenter(venue.coordinates[0], venue.coordinates[1]);
    setMapZoom(14.5);
  }
}
