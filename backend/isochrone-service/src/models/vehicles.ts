/**
 * Speed profile for different road types
 */
export interface SpeedProfile {
  highway: number; // km/h on highways
  rural: number; // km/h on rural roads
  urban: number; // km/h in urban areas
}

/**
 * Vehicle type interface
 */
export interface VehicleType {
  id: string;
  code: string;
  facility_type_id: string;
  name: string;
  description?: string;
  icon_url?: string;
  speed_profile: SpeedProfile;
  response_time: number; // minutes until ready for dispatch
}

/**
 * Vehicle instance interface
 */
export interface Vehicle {
  id: string;
  facility_id: string;
  vehicle_type_id: string;
  count: number;
}
