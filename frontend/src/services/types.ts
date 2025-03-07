// Basic geographic position
export interface Position {
  lat: number;
  lng: number;
}

// Traffic conditions interface
export interface TrafficConditions {
  considerTraffic: boolean;
  timeOfDay?: "current" | "morning_rush" | "evening_rush" | "off_peak";
  dayType?: "weekday" | "weekend";
  averageFactor?: number;
}

// Polygon geometry interface (GeoJSON)
export interface Polygon {
  type: "Polygon";
  coordinates: number[][][]; // GeoJSON format
}

// Isochrone metadata
export interface IsochroneMetadata {
  area_km2?: number;
  max_distance_km?: number;
  estimated_population?: number;
}

// Isochrone result interface
export interface Isochrone {
  id?: string;
  facility_id: string;
  facility_name?: string;
  vehicle_type: string;
  vehicle_name?: string;
  time_window: number;
  traffic_conditions: TrafficConditions;
  metadata?: IsochroneMetadata;
  geometry: Polygon;
  created_at?: Date;
  expires_at?: Date;
}
