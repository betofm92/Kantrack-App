export interface GeoPoint { latitude: number; longitude: number }
export interface DemoMapRoute { center: GeoPoint; points: GeoPoint[] }

// Coordenadas ficticias para previsualizar las dos rutas locales sin rastrear al conductor.
const routes: Record<string, DemoMapRoute> = {
  'demo-trip-1': {
    center: { latitude: 4.690, longitude: -74.068 },
    points: [
      { latitude: 4.675, longitude: -74.073 }, { latitude: 4.682, longitude: -74.060 },
      { latitude: 4.697, longitude: -74.041 }, { latitude: 4.709, longitude: -74.049 },
      { latitude: 4.724, longitude: -74.051 }, { latitude: 4.692, longitude: -74.084 },
      { latitude: 4.665, longitude: -74.104 }
    ]
  },
  'demo-trip-2': {
    center: { latitude: 4.650, longitude: -74.066 },
    points: [
      { latitude: 4.611, longitude: -74.072 }, { latitude: 4.624, longitude: -74.068 },
      { latitude: 4.642, longitude: -74.063 }, { latitude: 4.660, longitude: -74.057 }
    ]
  }
};

export function getDemoMapRoute(tripId: string): DemoMapRoute | undefined {
  return routes[tripId];
}
