/** @jsxImportSource react */
import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useStore } from '@nanostores/react';
import type { Feature, LineString } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
  mapCenter,
  mapZoom,
  venues,
  selectedVenue,
  activeSession,
  selectVenue,
  mapTheme,
  setMapTheme,
} from '@/store/mapStore';
import type { Venue } from '@/types';
import { getMapStyle } from './mapStyle';

// Helper to create beautiful custom marker DOM elements
function createMarkerElement(venue: Venue, isSelected: boolean, onClick: () => void): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `custom-marker ${isSelected ? 'selected' : ''}`;

  el.innerHTML = `
    <div class="custom-marker-ring"></div>
    <div class="custom-marker-icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 16px; height: 16px;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    </div>
    <div class="custom-marker-tooltip">
      <div class="tooltip-content">
        <p class="tooltip-title">${venue.name}</p>
        <p class="tooltip-subtitle">${venue.category} • ★ ${venue.weight}</p>
      </div>
      <div class="tooltip-arrow"></div>
    </div>
  `;

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  return el;
}

export default function FullScreenMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});

  const center = useStore(mapCenter);
  const zoom = useStore(mapZoom);
  const venueList = useStore(venues);
  const currentSelectedVenue = useStore(selectedVenue);
  const currentActiveSession = useStore(activeSession);
  const currentThemeMode = useStore(mapTheme);

  // Expose setMapTheme to window for easy debugging/control in console
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).setMapTheme = setMapTheme;
    }
  }, []);

  // 1. Initialize Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Get theme mode initial state
    const currentMode = mapTheme.get();
    let initialHour = new Date().getHours();
    if (currentMode === 'night') initialHour = 23;
    else if (currentMode === 'day') initialHour = 12;
    else if (currentMode === 'sunset') initialHour = 18;

    const style = getMapStyle(window.location.origin, initialHour);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: style as any,
      center: [...center],
      zoom: zoom,
      pitch: 45,
      bearing: -10,
      maxPitch: 75,
      pitchWithRotate: true,
      dragRotate: true,
      touchZoomRotate: true,
    });

    mapRef.current = map;

    // Force Globe projection once the style is loaded for Mapbox GL feel
    map.on('style.load', () => {
      try {
        if (typeof map.setProjection === 'function') {
          map.setProjection({ type: 'globe' });
        }
      } catch (err) {
        console.warn('Globe projection not supported on this maplibre version/environment:', err);
      }
    });

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        visualizePitch: true,
      }),
      'bottom-right'
    );

    map.on('moveend', () => {
      const newCenter = map.getCenter();
      const newZoom = map.getZoom();
      mapCenter.set([newCenter.lng, newCenter.lat]);
      mapZoom.set(newZoom);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Synchronize view center & zoom when updated from stores
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentCenter = map.getCenter();
    const hasCenterChanged = 
      Math.abs(currentCenter.lng - center[0]) > 0.0001 || 
      Math.abs(currentCenter.lat - center[1]) > 0.0001;

    if (hasCenterChanged || Math.abs(map.getZoom() - zoom) > 0.1) {
      map.flyTo({
        center: [...center],
        zoom: zoom,
        essential: true,
        duration: 1500,
      });
    }
  }, [center, zoom]);

  // 3. Synchronize Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clean up existing markers
    Object.keys(markersRef.current).forEach((id) => {
      markersRef.current[id].remove();
    });
    markersRef.current = {};

    // Re-add markers with selection state
    venueList.forEach((venue) => {
      const isSelected = currentSelectedVenue?.id === venue.id;
      
      const el = createMarkerElement(venue, isSelected, () => {
        selectVenue(venue);
        
        // Satisfying Cinematic Camera Fly-in on click
        map.flyTo({
          center: [...venue.coordinates],
          zoom: 14.5,
          pitch: 55,       // Cinematic 3D buildings tilt
          bearing: -15,     // Cyberpunk angle rotation
          duration: 1800,
          essential: true,
          // Shift center down to ensure the tooltip above marker has plenty of space and doesn't cut off
          offset: [0, window.innerHeight * 0.12] 
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([...venue.coordinates])
        .addTo(map);

      markersRef.current[venue.id] = marker;
    });
  }, [venueList, currentSelectedVenue]);

  // 4. Route drawing when session is active and en-route
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sourceId = 'active-route-source';
    const layerId = 'active-route-layer';

    const hasRoute = currentActiveSession?.status === 'EN_ROUTE' && currentActiveSession.destination;

    if (hasRoute && currentActiveSession.destination) {
      const startPt = center;
      const endPt = currentActiveSession.destination;

      // Draw dynamic curved line
      const midPt: [number, number] = [
        (startPt[0] + endPt[0]) / 2 + 0.005,
        (startPt[1] + endPt[1]) / 2 + 0.003
      ];

      const geojson: Feature<LineString> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [[...startPt], midPt, [...endPt]]
        }
      };

      const primary500 = typeof window !== 'undefined' ? window.getComputedStyle(document.documentElement).getPropertyValue('--primary-500').trim() || '#22c55e' : '#22c55e';
      const primary400 = typeof window !== 'undefined' ? window.getComputedStyle(document.documentElement).getPropertyValue('--primary-400').trim() || '#4ade80' : '#4ade80';

      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource(sourceId, { type: 'geojson', data: geojson });

        // Outer glow layer
        map.addLayer({
          id: `${layerId}-glow`,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': primary400,
            'line-width': 8,
            'line-opacity': 0.3
          }
        });

        // Main neon line layer
        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': primary500,
            'line-width': 4,
            'line-opacity': 0.95
          }
        });
      }

      // Fly to fit bounds of route
      const bounds = new maplibregl.LngLatBounds()
        .extend([...startPt])
        .extend([...endPt]);

      map.fitBounds(bounds, {
        padding: 80,
        maxZoom: 14,
        duration: 1500
      });
    } else {
      // Remove layers and source if inactive
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getLayer(`${layerId}-glow`)) map.removeLayer(`${layerId}-glow`);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    }
  }, [currentActiveSession, center]);

  // 5. Dynamic theme switcher logic (hot-swaps styles seamlessly)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let hour = new Date().getHours();
    if (currentThemeMode === 'night') hour = 23;
    else if (currentThemeMode === 'day') hour = 12;
    else if (currentThemeMode === 'sunset') hour = 18;

    const style = getMapStyle(window.location.origin, hour);
    
    // Check if style is loaded before modifying
    if (map.isStyleLoaded()) {
      map.setStyle(style as any, { diff: true });
    } else {
      map.once('style.load', () => {
        map.setStyle(style as any, { diff: true });
      });
    }
  }, [currentThemeMode]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: 'var(--bg-space)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)', zIndex: 10 }}></div>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
