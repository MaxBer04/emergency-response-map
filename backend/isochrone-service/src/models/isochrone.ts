/**
 * Position interface for geographic coordinates
 */
export interface Position {
  lat: number;
  lng: number;
}

/**
 * Polygon geometry interface
 */
export interface Polygon {
  type: "Polygon";
  coordinates: number[][][]; // GeoJSON format
}

/**
 * Traffic conditions interface
 */
export interface TrafficConditions {
  considerTraffic: boolean;
  timeOfDay?: "current" | "morning_rush" | "evening_rush" | "off_peak";
  dayType?: "weekday" | "weekend";
  averageFactor?: number;
}

/**
 * Isochrone metadata interface
 */
export interface IsochroneMetadata {
  area_km2?: number | null;
  max_distance_km?: number | null;
  estimated_population?: number | null;
}

/**
 * Isochrone calculation request interface
 */
export interface IsochroneRequest {
  facilityId: string;
  vehicleTypeId: string;
  timeWindow: number; // in minutes
  trafficConditions: TrafficConditions;
}

/**
 * Batch Isochrone calculation request
 */
export interface BatchIsochroneRequest {
  facilities: {
    id: string;
    vehicles: string[]; // Array of vehicle type IDs
  }[];
  timeWindows: number[]; // Array of time windows in minutes
  trafficConditions: TrafficConditions;
}

/**
 * Isochrone result interface
 */
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

/**
 * Grid point with travel time
 */
export interface GridPoint {
  position: Position;
  travelTime?: number; // in seconds
  reachable?: boolean;
}

/**
 * Database isochrone object
 */
export interface IsochroneDB {
  id: string;
  facility_id: string;
  facility_name?: string;
  vehicle_type_id: string;
  vehicle_name?: string;
  time_window: number;
  consider_traffic: boolean;
  time_of_day: string | null;
  day_type: string | null;
  geometry: any; // PostGIS geometry type
  area_km2: number | null;
  max_distance_km: number | null;
  created_at: Date;
  expires_at: Date;
}
