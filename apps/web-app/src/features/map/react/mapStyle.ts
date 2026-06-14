export interface MapTheme {
  background: string;
  earth: string;
  water: string;
  landuse: string;
  roadsCasing: string;
  roads: string;
  buildings: string;
  buildingsOpacity: number;
  light: {
    anchor: 'map' | 'viewport';
    color: string;
    intensity: number;
    position: [number, number, number];
  };
  sky: {
    'sky-color': string;
    'horizon-color': string;
    'sky-horizon-blend': number;
    'horizon-fog-blend'?: number;
    'fog-color'?: string;
    'fog-ground-blend'?: number;
    'atmosphere-blend': number;
  };
}

const getCSSVal = (name: string, fallback: string): string => {
  if (typeof window === 'undefined') return fallback;
  return window.getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

const getCSSNum = (name: string, fallback: number): number => {
  const val = getCSSVal(name, '');
  return val ? parseFloat(val) : fallback;
};

// Math utility to blend hex colors to simulate ambient lighting shading
function blendColors(baseHex: string, lightHex: string, factor: number): string {
  const parseHex = (hex: string) => {
    const clean = hex.replace('#', '').trim();
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  };

  try {
    const base = parseHex(baseHex);
    const light = parseHex(lightHex);

    const r = Math.round(base.r * (1 - factor) + light.r * factor);
    const g = Math.round(base.g * (1 - factor) + light.g * factor);
    const b = Math.round(base.b * (1 - factor) + light.b * factor);

    const toHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch (e) {
    return baseHex;
  }
}

// Compute dynamic ambient light shading for 2D/3D layers based on the active theme
const getShadedColor = (baseHex: string, theme: MapTheme, hour: number): string => {
  const isNight = hour >= 20 || hour < 5;
  const isSunrise = hour >= 5 && hour < 8;
  const isDay = hour >= 8 && hour < 17;

  if (isDay) {
    return baseHex; // Day is crisp and unblended
  }
  if (isNight) {
    // Night: Dim base color heavily, then blend in a cool moonlight tint
    const dimmed = blendColors(baseHex, '#05070f', 0.82);
    return blendColors(dimmed, theme.light.color, 0.12);
  }
  if (isSunrise) {
    // Sunrise: Soft rose gold / violet morning glow
    return blendColors(baseHex, theme.light.color, 0.22);
  }
  // Sunset: Cozy sunset cream-gold twilight wash
  return blendColors(baseHex, theme.light.color, 0.18);
};

// 4 time-based adaptive themes
export const getThemeForHour = (hour: number): MapTheme => {
  const isNight = hour >= 20 || hour < 5;
  const isSunrise = hour >= 5 && hour < 8;
  const isDay = hour >= 8 && hour < 17;

  // Structural constant fallback values for base map layers (matching the CSS design)
  const defaultBackground = '#f8fafc';
  const defaultEarth = '#ffffff';
  const defaultWater = '#bae6fd';
  const defaultLanduse = '#f1f5f9';
  const defaultRoadsCasing = '#e2e8f0';
  const defaultRoads = '#ffffff';
  const defaultBuildings = '#e2e8f0';
  const defaultBuildingsOpacity = 0.85;

  const defaultLightColor = isNight ? '#a5f3fc' : isSunrise ? '#fda4af' : isDay ? '#ffffff' : '#ffe4d6';
  const defaultLightIntensity = isNight ? 0.4 : isSunrise ? 0.75 : isDay ? 0.85 : 0.75;
  const defaultLightPos = isNight ? [1.15, 210, 30] : isSunrise ? [1.5, 70, 75] : isDay ? [1.15, 135, 30] : [1.5, 250, 65];

  const defaultSkyColor = isNight ? '#02040a' : isSunrise ? '#0c0a1c' : isDay ? '#bae6fd' : '#2e1a47';
  const defaultHorizonColor = isNight ? '#0b0f19' : isSunrise ? '#a855f7' : isDay ? '#ffffff' : '#ffdcd0';
  const defaultSkyHorizonBlend = isNight ? 0.5 : isSunrise ? 0.75 : isDay ? 0.6 : 0.7;
  const defaultHorizonFogBlend = isNight ? 0.3 : isSunrise ? 0.5 : isDay ? 0.5 : 0.5;
  const defaultFogColor = isNight ? '#0b0f19' : isSunrise ? '#a855f7' : isDay ? '#bae6fd' : '#ffdcd0';
  const defaultFogGroundBlend = isNight ? 0.3 : isSunrise ? 0.5 : isDay ? 0.5 : 0.5;
  const defaultAtmosphereBlend = isNight ? 0.6 : isSunrise ? 0.9 : isDay ? 0.8 : 0.9;

  return {
    background: getCSSVal('--map-background', defaultBackground),
    earth: getCSSVal('--map-earth', defaultEarth),
    water: getCSSVal('--map-water', defaultWater),
    landuse: getCSSVal('--map-landuse', defaultLanduse),
    roadsCasing: getCSSVal('--map-roads-casing', defaultRoadsCasing),
    roads: getCSSVal('--map-roads', defaultRoads),
    buildings: getCSSVal('--map-buildings', defaultBuildings),
    buildingsOpacity: getCSSNum('--map-buildings-opacity', defaultBuildingsOpacity),
    light: {
      anchor: 'viewport',
      color: getCSSVal('--map-light-color', defaultLightColor),
      intensity: getCSSNum('--map-light-intensity', defaultLightIntensity),
      position: [
        getCSSNum('--map-light-pos-r', defaultLightPos[0]),
        getCSSNum('--map-light-pos-a', defaultLightPos[1]),
        getCSSNum('--map-light-pos-p', defaultLightPos[2])
      ]
    },
    sky: {
      'sky-color': getCSSVal('--map-sky-color', defaultSkyColor),
      'horizon-color': getCSSVal('--map-horizon-color', defaultHorizonColor),
      'sky-horizon-blend': getCSSNum('--map-sky-horizon-blend', defaultSkyHorizonBlend),
      'horizon-fog-blend': getCSSNum('--map-horizon-fog-blend', defaultHorizonFogBlend),
      'fog-color': getCSSVal('--map-fog-color', defaultFogColor),
      'fog-ground-blend': getCSSNum('--map-fog-ground-blend', defaultFogGroundBlend),
      'atmosphere-blend': getCSSNum('--map-atmosphere-blend', defaultAtmosphereBlend)
    }
  };
};

export const getMapStyle = (origin: string, hour: number) => {
  const theme = getThemeForHour(hour);

  // Apply dynamic ambient light shading to the constant base layers
  const background = getShadedColor(theme.background, theme, hour);
  const earth = getShadedColor(theme.earth, theme, hour);
  const water = getShadedColor(theme.water, theme, hour);
  const landuse = getShadedColor(theme.landuse, theme, hour);
  const roadsCasing = getShadedColor(theme.roadsCasing, theme, hour);
  const roads = getShadedColor(theme.roads, theme, hour);
  const buildings = getShadedColor(theme.buildings, theme, hour);

  return {
    version: 8,
    sources: {
      protomaps: {
        type: 'vector',
        tiles: [
          `${origin}/tiles/indonesia/{z}/{x}/{y}`
        ],
        minzoom: 0,
        maxzoom: 15
      }
    },
    glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    light: theme.light,
    sky: theme.sky,
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': background
        }
      },
      {
        id: 'earth',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'earth',
        paint: {
          'fill-color': earth
        }
      },
      {
        id: 'water',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'water',
        paint: {
          'fill-color': water
        }
      },
      {
        id: 'landuse',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'landuse',
        paint: {
          'fill-color': landuse
        }
      },
      {
        id: 'roads-casing',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'roads',
        paint: {
          'line-color': roadsCasing,
          'line-width': 1.5
        }
      },
      {
        id: 'roads',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'roads',
        paint: {
          'line-color': roads,
          'line-width': 1
        }
      },
      // 3D Buildings Extrusion using fill-extrusion type
      {
        id: 'buildings-3d',
        type: 'fill-extrusion',
        source: 'protomaps',
        'source-layer': 'buildings',
        paint: {
          'fill-extrusion-color': buildings,
          'fill-extrusion-height': [
            'coalesce',
            ['get', 'height'],
            15 // Default height if not specified in OSM data
          ],
          'fill-extrusion-base': [
            'coalesce',
            ['get', 'min_height'],
            0
          ],
          'fill-extrusion-opacity': theme.buildingsOpacity
        }
      }
    ]
  };
};
