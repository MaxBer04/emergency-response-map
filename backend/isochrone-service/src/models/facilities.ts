import { Position } from "./isochrone";

/**
 * Facility type interface
 */
export interface FacilityType {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon_url?: string;
}

/**
 * Facility contact information
 */
export interface FacilityContact {
  phone?: string;
  email?: string;
  website?: string;
}

/**
 * Facility interface
 */
export interface Facility {
  id: string;
  facility_type_id: string;
  facility_type_name?: string;
  name: string;
  address: string;
  location: Position;
  contact?: FacilityContact;
  vehicles?: {
    vehicle_type_id: string;
    vehicle_type_name: string;
    count: number;
  }[];
}

/**
 * Region type enum
 */
export enum RegionType {
  COUNTRY = "country",
  STATE = "state",
  CITY = "city",
  DISTRICT = "district",
}

/**
 * Geographic bounds
 */
export interface Bounds {
  northeast: Position;
  southwest: Position;
}

/**
 * Region interface
 */
export interface Region {
  id: string;
  code: string;
  name: string;
  type: RegionType;
  center: Position;
  bounds: Bounds;
}
