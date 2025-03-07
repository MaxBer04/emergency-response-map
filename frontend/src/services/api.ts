import { Position, Isochrone, TrafficConditions } from "./types";

export interface FacilityType {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon_url?: string;
}

export interface Facility {
  id: string;
  facility_type_id: string;
  name: string;
  address: string;
  location: Position;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  vehicles?: {
    vehicle_type_id: string;
    vehicle_type_name: string;
    count: number;
  }[];
}

export interface VehicleType {
  id: string;
  code: string;
  facility_type_id: string;
  name: string;
  description?: string;
  icon_url?: string;
  highway_speed: number;
  rural_speed: number;
  urban_speed: number;
  response_time: number;
}

const API_BASE_URL = "/api";

// Utility function for making API requests
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Facility Types APIs
export const fetchFacilityTypes = async (): Promise<FacilityType[]> => {
  const response = await fetchApi<{ facility_types: FacilityType[] }>("/db/facility-types");
  return response.facility_types;
};

// Facilities APIs
export const fetchFacilities = async (
  facilityTypeId?: string,
  regionId?: string
): Promise<Facility[]> => {
  let endpoint = "/db/facilities";
  const params = new URLSearchParams();

  if (facilityTypeId) {
    params.append("type", facilityTypeId);
  }

  if (regionId) {
    params.append("region", regionId);
  }

  const queryString = params.toString();
  if (queryString) {
    endpoint += `?${queryString}`;
  }

  const response = await fetchApi<{ facilities: Facility[] }>(endpoint);
  return response.facilities;
};

export const fetchFacilityById = async (facilityId: string): Promise<Facility> => {
  const response = await fetchApi<{ facility: Facility }>(`/db/facilities/${facilityId}`);
  return response.facility;
};

// Vehicle Types APIs
export const fetchVehicleTypes = async (facilityTypeId: string): Promise<VehicleType[]> => {
  const response = await fetchApi<{ vehicle_types: VehicleType[] }>(
    `/db/vehicle-types?facilityType=${facilityTypeId}`
  );
  return response.vehicle_types;
};

// Isochrone APIs
export const calculateIsochrone = async (
  facilityId: string,
  vehicleTypeId: string,
  timeWindow: number,
  trafficConditions: TrafficConditions
): Promise<Isochrone> => {
  const response = await fetchApi<{ status: string; data: Isochrone }>("/isochrones/calculate", {
    method: "POST",
    body: JSON.stringify({
      facilityId,
      vehicleTypeId,
      timeWindow,
      trafficConditions,
    }),
  });

  return response.data;
};

export const calculateBatchIsochrones = async (
  facilities: { id: string; vehicles: string[] }[],
  timeWindows: number[],
  trafficConditions: TrafficConditions
): Promise<Isochrone[]> => {
  const response = await fetchApi<{ status: string; data: Isochrone[] }>("/isochrones/batch", {
    method: "POST",
    body: JSON.stringify({
      facilities,
      timeWindows,
      trafficConditions,
    }),
  });

  return response.data;
};
