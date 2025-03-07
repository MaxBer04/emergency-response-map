// frontend/src/components/GeoJsonPolygonLayer.tsx
import React, { useEffect, useState } from "react";
import { Polygon } from "@react-google-maps/api";
import { Isochrone } from "../services/types";

interface GeoJsonPolygonLayerProps {
  isochrones: Isochrone[];
  timeColors: { [key: number]: string };
}

const GeoJsonPolygonLayer: React.FC<GeoJsonPolygonLayerProps> = ({ isochrones, timeColors }) => {
  const [polygons, setPolygons] = useState<any[]>([]);

  useEffect(() => {
    // Convert GeoJSON polygons to Google Maps paths
    const convertedPolygons = isochrones.map((isochrone) => {
      // Get the first polygon ring (exterior)
      const coordinates = isochrone.geometry.coordinates[0];

      // Convert to Google Maps LatLng format
      const paths = coordinates.map((coord) => ({
        lat: coord[1], // GeoJSON format is [longitude, latitude]
        lng: coord[0],
      }));

      return {
        paths,
        time: isochrone.time_window,
        color: timeColors[isochrone.time_window] || "rgba(0, 0, 255, 0.2)",
        id:
          isochrone.id ||
          `${isochrone.facility_id}-${isochrone.vehicle_type}-${isochrone.time_window}`,
      };
    });

    setPolygons(convertedPolygons);
  }, [isochrones, timeColors]);

  return (
    <>
      {polygons.map((polygon) => (
        <Polygon
          key={polygon.id}
          paths={polygon.paths}
          options={{
            fillColor: polygon.color,
            fillOpacity: 0.5,
            strokeColor: polygon.color,
            strokeOpacity: 1,
            strokeWeight: 1,
          }}
        />
      ))}
    </>
  );
};

export default GeoJsonPolygonLayer;
