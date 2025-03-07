import { db } from "../client";
import logger from "../../utils/logger";
import { Isochrone, IsochroneDB, TrafficConditions } from "../../models/isochrone.js";

/**
 * Repository for isochrone data operations
 */
export class IsochroneRepository {
  /**
   * Find an existing isochrone in the database
   */
  async findIsochrone(
    facilityId: string,
    vehicleTypeId: string,
    timeWindow: number,
    trafficConditions: TrafficConditions
  ): Promise<Isochrone | null> {
    try {
      const result = await db.oneOrNone<IsochroneDB>(
        `SELECT 
          i.id, i.facility_id, i.vehicle_type_id, i.time_window, 
          i.consider_traffic, i.time_of_day, i.day_type, 
          ST_AsGeoJSON(i.geometry) as geometry,
          i.area_km2, i.max_distance_km, i.created_at, i.expires_at,
          f.name as facility_name,
          vt.name as vehicle_name
        FROM isochrones i
        JOIN facilities f ON i.facility_id = f.id
        JOIN vehicle_types vt ON i.vehicle_type_id = vt.id
        WHERE 
          i.facility_id = $1 AND 
          i.vehicle_type_id = $2 AND 
          i.time_window = $3 AND 
          i.consider_traffic = $4 AND 
          (i.time_of_day = $5 OR (i.time_of_day IS NULL AND $5 IS NULL)) AND 
          (i.day_type = $6 OR (i.day_type IS NULL AND $6 IS NULL)) AND 
          i.expires_at > NOW()`,
        [
          facilityId,
          vehicleTypeId,
          timeWindow,
          trafficConditions.considerTraffic,
          trafficConditions.timeOfDay || null,
          trafficConditions.dayType || null,
        ]
      );

      if (!result) return null;

      // Parse the GeoJSON geometry
      const geometryJson = JSON.parse(result.geometry);

      return {
        id: result.id,
        facility_id: result.facility_id,
        facility_name: result.facility_name,
        vehicle_type: result.vehicle_type_id,
        vehicle_name: result.vehicle_name,
        time_window: result.time_window,
        traffic_conditions: {
          considerTraffic: result.consider_traffic,
          timeOfDay: result.time_of_day as any,
          dayType: result.day_type as any,
        },
        metadata: {
          area_km2: result.area_km2,
          max_distance_km: result.max_distance_km,
        },
        geometry: geometryJson,
        created_at: result.created_at,
        expires_at: result.expires_at,
      };
    } catch (error) {
      logger.error(`Error finding isochrone: ${error}`);
      return null;
    }
  }

  /**
   * Save a new isochrone to the database
   */
  async saveIsochrone(
    isochrone: Isochrone,
    expiresInSeconds: number = 3600
  ): Promise<string | null> {
    try {
      const result = await db.one(
        `INSERT INTO isochrones (
          facility_id, vehicle_type_id, time_window, 
          consider_traffic, time_of_day, day_type,
          geometry, area_km2, max_distance_km, expires_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 
          ST_GeomFromGeoJSON($7), $8, $9, 
          NOW() + INTERVAL '${expiresInSeconds} seconds'
        ) RETURNING id`,
        [
          isochrone.facility_id,
          isochrone.vehicle_type,
          isochrone.time_window,
          isochrone.traffic_conditions.considerTraffic,
          isochrone.traffic_conditions.timeOfDay || null,
          isochrone.traffic_conditions.dayType || null,
          JSON.stringify(isochrone.geometry),
          isochrone.metadata?.area_km2 || null,
          isochrone.metadata?.max_distance_km || null,
        ]
      );

      return result.id;
    } catch (error) {
      logger.error(`Error saving isochrone: ${error}`);
      return null;
    }
  }

  /**
   * Delete expired isochrones
   */
  async cleanupExpiredIsochrones(): Promise<number> {
    try {
      const result = await db.result(`DELETE FROM isochrones WHERE expires_at < NOW()`);
      return result.rowCount;
    } catch (error) {
      logger.error(`Error cleaning up expired isochrones: ${error}`);
      return 0;
    }
  }
}

export default new IsochroneRepository();
