import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker, Circle } from "@react-google-maps/api";
import GeoJsonPolygonLayer from "./GeoJsonPolygonLayer";
import styled from "styled-components";
import * as api from "../services/api";
import { Position, TrafficConditions, Isochrone } from "../services/types";
import { FacilityType, Facility, VehicleType } from "../services/api";

// TypeScript Interfaces
/* interface Location {
  id: string;
  name: string;
  position: Position;
}
 */
interface IsochroneDisplay {
  center: Position;
  radius: number;
  color: string;
  time: number;
  vehicleName: string;
  locationName: string;
}

interface TimeColorsMap {
  [key: number]: string;
}

const libraries: ["places"] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "70vh",
};
const center: Position = {
  lat: 51.165691, // Example coordinates for Germany
  lng: 10.451526,
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const ControlPanel = styled.div`
  background: #1f1f1f;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const MapContainer = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

// Colors for different time windows
const timeColors: TimeColorsMap = {
  15: "rgba(255, 0, 0, 0.2)", // Red
  30: "rgba(255, 165, 0, 0.2)", // Orange
  60: "rgba(255, 255, 0, 0.2)", // Yellow
  120: "rgba(0, 128, 0, 0.2)", // Green
};

const EmergencyResponseMap: React.FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  // State variables
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);
  const [selectedFacilityType, setSelectedFacilityType] = useState<string>("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<Facility[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<number[]>([]);
  const [considerTraffic, setConsiderTraffic] = useState<boolean>(false);
  const [isochrones, setIsochrones] = useState<IsochroneDisplay[]>([]);
  const [apiIsochrones, setApiIsochrones] = useState<Isochrone[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Load facility types when component mounts
  useEffect(() => {
    const loadFacilityTypes = async () => {
      try {
        const types = await api.fetchFacilityTypes();
        setFacilityTypes(types);
      } catch (error) {
        console.error("Error loading facility types:", error);
        setError("Failed to load facility types. Please try again.");
      }
    };

    loadFacilityTypes();
  }, []);

  // Load facilities when facility type changes
  useEffect(() => {
    if (!selectedFacilityType) return;

    const loadFacilities = async () => {
      try {
        const loadedFacilities = await api.fetchFacilities(selectedFacilityType);
        setFacilities(loadedFacilities);
      } catch (error) {
        console.error("Error loading facilities:", error);
        setError("Failed to load facilities. Please try again.");
      }
    };

    loadFacilities();
  }, [selectedFacilityType]);

  // Load vehicle types when facility type changes
  useEffect(() => {
    if (!selectedFacilityType) return;

    const loadVehicleTypes = async () => {
      try {
        const types = await api.fetchVehicleTypes(selectedFacilityType);
        setVehicleTypes(types);
      } catch (error) {
        console.error("Error loading vehicle types:", error);
        setError("Failed to load vehicle types. Please try again.");
      }
    };

    loadVehicleTypes();
  }, [selectedFacilityType]);

  // Facility type selection handler
  const handleFacilityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    setSelectedFacilityType(type);
    setSelectedFacilities([]);
    setSelectedVehicles([]);
    setIsochrones([]);
  };

  // Facility selection handler
  const handleFacilityChange = (facility: Facility) => {
    const isSelected = selectedFacilities.some((fac) => fac.id === facility.id);

    if (isSelected) {
      setSelectedFacilities(selectedFacilities.filter((fac) => fac.id !== facility.id));
    } else {
      setSelectedFacilities([...selectedFacilities, facility]);
    }
  };

  // Vehicle type selection handler
  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vehicleId = e.target.value;
    const isSelected = selectedVehicles.includes(vehicleId);

    if (isSelected) {
      setSelectedVehicles(selectedVehicles.filter((id) => id !== vehicleId));
    } else {
      setSelectedVehicles([...selectedVehicles, vehicleId]);
    }
  };

  // Time window selection handler
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(e.target.value);
    const isSelected = selectedTimes.includes(time);

    if (isSelected) {
      setSelectedTimes(selectedTimes.filter((t) => t !== time));
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  // Traffic consideration handler
  const handleTrafficChange = () => {
    setConsiderTraffic(!considerTraffic);
  };

  // Calculate isochrones
  const calculateIsochrones = async () => {
    if (
      selectedFacilities.length === 0 ||
      selectedVehicles.length === 0 ||
      selectedTimes.length === 0
    ) {
      setError("Please select at least one facility, vehicle, and time window.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare request for batch calculation
      const facilitiesForRequest = selectedFacilities.map((facility) => ({
        id: facility.id,
        vehicles: selectedVehicles,
      }));

      const trafficConditions: TrafficConditions = {
        considerTraffic,
        timeOfDay: considerTraffic ? "current" : undefined,
        dayType: considerTraffic ? "weekday" : undefined,
      };

      // Call the batch API
      const isochroneResults = await api.calculateBatchIsochrones(
        facilitiesForRequest,
        selectedTimes,
        trafficConditions
      );

      // Store the original isochrones from API for GeoJSON rendering
      setApiIsochrones(isochroneResults);

      // Convert API isochrones to display format
      // Note: This is a simplified approach using circles
      // In a more advanced implementation, you would render the actual polygon geometry
      const displayIsochrones: IsochroneDisplay[] = [];

      for (const isochrone of isochroneResults) {
        // Find the facility to get its position
        const facility = selectedFacilities.find((f) => f.id === isochrone.facility_id);
        if (!facility) continue;

        // Get the max radius from the metadata
        const radiusM = isochrone.metadata?.max_distance_km
          ? isochrone.metadata.max_distance_km * 1000 // Convert km to meters for Google Maps
          : estimateRadiusFromGeometry(isochrone);

        displayIsochrones.push({
          center: facility.location,
          radius: radiusM,
          color: timeColors[isochrone.time_window] || "rgba(0, 0, 255, 0.2)", // Default blue
          time: isochrone.time_window,
          vehicleName: isochrone.vehicle_name || "Unknown vehicle",
          locationName: facility.name,
        });
      }

      setIsochrones(displayIsochrones);

      // Fit map to show all isochrones
      if (displayIsochrones.length > 0 && mapRef.current) {
        const bounds = new google.maps.LatLngBounds();

        displayIsochrones.forEach((iso) => {
          // Add facility location to bounds
          bounds.extend(new google.maps.LatLng(iso.center.lat, iso.center.lng));

          // Add a point at the edge of the isochrone to better fit the map
          const northPoint = google.maps.geometry.spherical.computeOffset(
            new google.maps.LatLng(iso.center.lat, iso.center.lng),
            iso.radius,
            0 // North
          );
          const southPoint = google.maps.geometry.spherical.computeOffset(
            new google.maps.LatLng(iso.center.lat, iso.center.lng),
            iso.radius,
            180 // South
          );
          const eastPoint = google.maps.geometry.spherical.computeOffset(
            new google.maps.LatLng(iso.center.lat, iso.center.lng),
            iso.radius,
            90 // East
          );
          const westPoint = google.maps.geometry.spherical.computeOffset(
            new google.maps.LatLng(iso.center.lat, iso.center.lng),
            iso.radius,
            270 // West
          );

          bounds.extend(northPoint);
          bounds.extend(southPoint);
          bounds.extend(eastPoint);
          bounds.extend(westPoint);
        });

        mapRef.current.fitBounds(bounds);
      }
    } catch (error) {
      console.error("Error calculating isochrones:", error);
      setError("Failed to calculate isochrones. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to estimate radius from GeoJSON polygon
  const estimateRadiusFromGeometry = (isochrone: Isochrone): number => {
    // Simple estimation: average distance from center to vertices
    try {
      // Find the corresponding facility
      const facility = selectedFacilities.find((f) => f.id === isochrone.facility_id);
      if (!facility) return 5000; // Default 5km radius

      const facilityLocation = facility.location;

      // Get all polygon coordinates (first ring only for simplicity)
      const coordinates = isochrone.geometry.coordinates[0];

      // Calculate average distance
      let totalDistance = 0;
      let count = 0;

      for (const coord of coordinates) {
        const [lng, lat] = coord;
        const distance = getDistanceFromLatLonInM(
          facilityLocation.lat,
          facilityLocation.lng,
          lat,
          lng
        );
        totalDistance += distance;
        count++;
      }

      return count > 0 ? totalDistance / count : 5000; // Default 5km radius
    } catch (e) {
      console.error("Error estimating radius from geometry:", e);
      return 5000; // Default 5km radius
    }
  };

  // Calculate distance between two points in meters
  function getDistanceFromLatLonInM(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  if (loadError) return <div>Error loading the map</div>;
  if (!isLoaded) return <div>Loading the map...</div>;

  return (
    <Wrapper>
      <ControlPanel>
        <div>
          <h3>Facility Type</h3>
          <select onChange={handleFacilityTypeChange} value={selectedFacilityType}>
            <option value="">Please select</option>
            {facilityTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {selectedFacilityType && (
          <>
            <div>
              <h3>Facilities</h3>
              {facilities.map((facility) => (
                <div key={facility.id}>
                  <input
                    type="checkbox"
                    id={`facility-${facility.id}`}
                    checked={selectedFacilities.some((f) => f.id === facility.id)}
                    onChange={() => handleFacilityChange(facility)}
                  />
                  <label htmlFor={`facility-${facility.id}`}>{facility.name}</label>
                </div>
              ))}
            </div>

            <div>
              <h3>Vehicle Types</h3>
              {vehicleTypes.map((vehicle) => (
                <div key={vehicle.id}>
                  <input
                    type="checkbox"
                    id={`vehicle-${vehicle.id}`}
                    value={vehicle.id}
                    checked={selectedVehicles.includes(vehicle.id)}
                    onChange={handleVehicleChange}
                  />
                  <label htmlFor={`vehicle-${vehicle.id}`}>{vehicle.name}</label>
                </div>
              ))}
            </div>

            <div>
              <h3>Time Windows (minutes)</h3>
              {[15, 30, 60, 120].map((time) => (
                <div key={time}>
                  <input
                    type="checkbox"
                    id={`time-${time}`}
                    value={time}
                    checked={selectedTimes.includes(time)}
                    onChange={handleTimeChange}
                  />
                  <label htmlFor={`time-${time}`}>{time} minutes</label>
                </div>
              ))}
            </div>

            <div>
              <h3>Traffic</h3>
              <input
                type="checkbox"
                id="traffic"
                checked={considerTraffic}
                onChange={handleTrafficChange}
              />
              <label htmlFor="traffic">Consider current traffic</label>
            </div>

            <button onClick={calculateIsochrones} disabled={isLoading}>
              {isLoading ? "Calculating..." : "Calculate Accessibility"}
            </button>

            {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
          </>
        )}
      </ControlPanel>

      <MapContainer>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={6}
          center={center}
          onLoad={onMapLoad}
        >
          {selectedFacilities.map((facility) => (
            <Marker key={facility.id} position={facility.location} title={facility.name} />
          ))}

          {/* Render simplified circle isochrones for backward compatibility */}
          {isochrones.map((isochrone, idx) => (
            <Circle
              key={idx}
              center={isochrone.center}
              radius={isochrone.radius}
              options={{
                fillColor: isochrone.color,
                fillOpacity: 0.5,
                strokeColor: isochrone.color,
                strokeOpacity: 1,
                strokeWeight: 1,
              }}
            />
          ))}

          {/* Render actual GeoJSON polygons if available */}
          {apiIsochrones.length > 0 && (
            <GeoJsonPolygonLayer isochrones={apiIsochrones} timeColors={timeColors} />
          )}
        </GoogleMap>
      </MapContainer>

      {isochrones.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Legend:</h3>
          {selectedTimes
            .sort((a, b) => a - b)
            .map((time) => (
              <div key={time} style={{ display: "flex", alignItems: "center", margin: "5px 0" }}>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: timeColors[time],
                    marginRight: "10px",
                    border: "1px solid black",
                  }}
                ></div>
                <span>{time} minutes</span>
              </div>
            ))}
        </div>
      )}
    </Wrapper>
  );
};

export default EmergencyResponseMap;
