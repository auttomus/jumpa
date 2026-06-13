/** @jsxImportSource react */
import React, { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, LineString } from 'geojson';
import type { Venue } from '@/types';
import {
  mapCenter,
  mapZoom,
  venues,
  selectedVenue,
  activeSession,
  selectVenue,
} from '@/store/mapStore';

export default function FullScreenMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});

  const center = useStore(mapCenter);
  const zoom = useStore(mapZoom);
  const venueList = useStore(venues);
  const currentSelectedVenue = useStore(selectedVenue);
  const currentActiveSession = useStore(activeSession);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapStyle = {
      version: 8,
      sources: {
        protomaps: {
          type: 'vector',
          url: '/tiles/indonesia'
        }
      },
      glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#02040a'
          }
        },
        {
          id: 'earth',
          type: 'fill',
          source: 'protomaps',
          'source-layer': 'earth',
          paint: {
            'fill-color': '#0b0f19'
          }
        },
        {
          id: 'water',
          type: 'fill',
          source: 'protomaps',
          'source-layer': 'water',
          paint: {
            'fill-color': '#082f49'
          }
        },
        {
          id: 'landuse',
          type: 'fill',
          source: 'protomaps',
          'source-layer': 'landuse',
          paint: {
            'fill-color': '#111827'
          }
        },
        {
          id: 'roads-casing',
          type: 'line',
          source: 'protomaps',
          'source-layer': 'roads',
          paint: {
            'line-color': '#1f2937',
            'line-width': 1.5
          }
        },
        {
          id: 'roads',
          type: 'line',
          source: 'protomaps',
          'source-layer': 'roads',
          paint: {
            'line-color': '#374151',
            'line-width': 1
          }
        },
        {
          id: 'buildings',
          type: 'fill',
          source: 'protomaps',
          'source-layer': 'buildings',
          paint: {
            'fill-color': '#1f2937',
            'fill-opacity': 0.6
          }
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle as any,
      center: [...center],
      zoom: zoom,
      pitch: 45,
      bearing: -10,
    });

    mapRef.current = map;

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

  // Update center and zoom when modified externally
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentCenter = map.getCenter();
    const centerDiff = 
      Math.abs(currentCenter.lng - center[0]) > 0.0001 || 
      Math.abs(currentCenter.lat - center[1]) > 0.0001;

    if (centerDiff || Math.abs(map.getZoom() - zoom) > 0.1) {
      map.flyTo({
        center: [...center],
        zoom: zoom,
        essential: true,
        duration: 1500,
      });
    }
  }, [center, zoom]);

  // Sync Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.keys(markersRef.current).forEach((id) => {
      markersRef.current[id].remove();
    });
    markersRef.current = {};

    venueList.forEach((venue) => {
      const el = document.createElement('div');
      const isSelected = currentSelectedVenue?.id === venue.id;
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
        selectVenue(venue);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([...venue.coordinates])
        .addTo(map);

      markersRef.current[venue.id] = marker;
    });
  }, [venueList, currentSelectedVenue]);

  // Route drawing when session is EN_ROUTE
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const routeSourceId = 'active-route-source';
    const routeLayerId = 'active-route-layer';

    if (currentActiveSession?.status === 'EN_ROUTE' && currentActiveSession.destination) {
      const startPt = center;
      const endPt = currentActiveSession.destination;

      const midPt: [number, number] = [
        (startPt[0] + endPt[0]) / 2 + 0.005,
        (startPt[1] + endPt[1]) / 2 + 0.003
      ];

      const geojson: Feature<LineString> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [...startPt],
            midPt,
            [...endPt]
          ]
        }
      };

      if (map.getSource(routeSourceId)) {
        (map.getSource(routeSourceId) as maplibregl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource(routeSourceId, {
          type: 'geojson',
          data: geojson
        });

        map.addLayer({
          id: `${routeLayerId}-glow`,
          type: 'line',
          source: routeSourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#06b6d4',
            'line-width': 8,
            'line-opacity': 0.3
          }
        });

        map.addLayer({
          id: routeLayerId,
          type: 'line',
          source: routeSourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#22d3ee',
            'line-width': 4,
            'line-opacity': 0.95
          }
        });
      }

      const bounds = new maplibregl.LngLatBounds()
        .extend([...startPt])
        .extend([...endPt]);

      map.fitBounds(bounds, {
        padding: 80,
        maxZoom: 14,
        duration: 1500
      });

    } else {
      if (map.getLayer(routeLayerId)) map.removeLayer(routeLayerId);
      if (map.getLayer(`${routeLayerId}-glow`)) map.removeLayer(`${routeLayerId}-glow`);
      if (map.getSource(routeSourceId)) map.removeSource(routeSourceId);
    }
  }, [currentActiveSession, center]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#02040a', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)', zIndex: 10 }}></div>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
