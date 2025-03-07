import { db } from "../db/client";
import GridService from "./grid";
import DistanceService from "./distance";
import PolygonService from "./polygon";
import isochroneRepos from "../db/repositories/isochroneRepos";
import {
  Isochrone,
  IsochroneRequest,
  Position,
  TrafficConditions,
  BatchIsochroneRequest,
} from "../models/isochrone.js";
import config from "../config/index.js";
import logger from "../utils/logger.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

/**
 * Service for calculating isochrones
 */
export default class IsochroneService {
  private distanceService: DistanceService;

  constructor() {
    this.distanceService = new DistanceService();
  }

  /**
   * Calculate a single isochrone
   * @param request Isochrone calculation request
   * @returns Calculated isochrone
   */
  async calculateIsochrone(request: IsochroneRequest): Promise<Isochrone> {
    const { facilityId, vehicleTypeId, timeWindow, trafficConditions } = request;

    // Check if we already have this isochrone cached
    const cachedIsochrone = await isochroneRepos.findIsochrone(
      facilityId,
      vehicleTypeId,
      timeWindow,
      trafficConditions
    );

    if (cachedIsochrone) {
      logger.info(`Found cached isochrone for facility ${facilityId} and vehicle ${vehicleTypeId}`);
      return cachedIsochrone;
    }

    // Get facility location
    const facility = await this.getFacilityById(facilityId);
    if (!facility) {
      throw new NotFoundError(`Facility with ID ${facilityId} not found`);
    }

    // Get vehicle type details
    const vehicleType = await this.getVehicleTypeById(vehicleTypeId);
    if (!vehicleType) {
      throw new NotFoundError(`Vehicle type with ID ${vehicleTypeId} not found`);
    }

    // Check if vehicle type is available at this facility
    const vehicleAvailable = await this.isVehicleAvailableAtFacility(facilityId, vehicleTypeId);
    if (!vehicleAvailable) {
      throw new BadRequestError(
        `Vehicle type ${vehicleTypeId} is not available at facility ${facilityId}`
      );
    }

    // Generate grid points
    logger.info(`Generating grid points for facility ${facilityId}`);
    const gridPoints = GridService.generateGridPoints(
      facility.location,
      config.isochrone.maxGridRadius
    );

    // Create batches for processing
    const gridBatches = GridService.createBatches(gridPoints, config.isochrone.maxBatchSize);

    // Calculate travel times
    logger.info(
      `Calculating travel times for ${gridPoints.length} points in ${gridBatches.length} batches`
    );
    const pointsWithTimes = await this.distanceService.processBatches(
      facility.location,
      gridBatches,
      trafficConditions
    );

    // Filter points by time window
    const reachablePoints = GridService.filterByTravelTime(pointsWithTimes, timeWindow);
    logger.info(`Found ${reachablePoints.length} reachable points within ${timeWindow} minutes`);

    // Generate polygon
    const polygon = PolygonService.generatePolygon(reachablePoints);

    // Calculate metadata
    const centerCoordinates: [number, number] = [facility.location.lng, facility.location.lat];
    const metadata = PolygonService.calculateMetadata(polygon, centerCoordinates);

    // Create isochrone object
    const isochrone: Isochrone = {
      facility_id: facilityId,
      facility_name: facility.name,
      vehicle_type: vehicleTypeId,
      vehicle_name: vehicleType.name,
      time_window: timeWindow,
      traffic_conditions: trafficConditions,
      metadata,
      geometry: polygon,
    };

    // Save to cache
    const isochroneId = await isochroneRepos.saveIsochrone(
      isochrone,
      config.isochrone.cacheDuration
    );

    if (isochroneId) {
      isochrone.id = isochroneId;
      logger.info(`Saved isochrone with ID ${isochroneId} to cache`);
    }

    return isochrone;
  }

  /**
   * Calculate multiple isochrones in batch
   * @param request Batch isochrone calculation request
   * @returns Array of calculated isochrones
   */
  async calculateBatchIsochrones(request: BatchIsochroneRequest): Promise<Isochrone[]> {
    const { facilities, timeWindows, trafficConditions } = request;
    const results: Isochrone[] = [];

    // Process each facility
    for (const facility of facilities) {
      // Process each vehicle type
      for (const vehicleTypeId of facility.vehicles) {
        // Process each time window
        for (const timeWindow of timeWindows) {
          try {
            const isochrone = await this.calculateIsochrone({
              facilityId: facility.id,
              vehicleTypeId,
              timeWindow,
              trafficConditions,
            });

            results.push(isochrone);
          } catch (error) {
            logger.error(
              `Error calculating isochrone for facility ${facility.id}, vehicle ${vehicleTypeId}, time ${timeWindow}: ${error}`
            );
            // Continue with other calculations even if one fails
          }
        }
      }
    }

    return results;
  }

  /**
   * Retrieve isochrones for a facility and vehicle type
   * @param facilityId Facility ID
   * @param vehicleTypeId Vehicle type ID
   * @returns Array of isochrones
   */
  async getIsochronesByFacilityAndVehicle(
    facilityId: string,
    vehicleTypeId: string
  ): Promise<Isochrone[]> {
    try {
      // Query database for saved isochrones
      const isochrones = await db.manyOrNone(
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
          i.expires_at > NOW()
        ORDER BY i.time_window ASC`,
        [facilityId, vehicleTypeId]
      );

      // Convert database results to Isochrone objects
      return isochrones.map((result) => ({
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
        geometry: JSON.parse(result.geometry),
        created_at: result.created_at,
        expires_at: result.expires_at,
      }));
    } catch (error) {
      logger.error(
        `Error getting isochrones for facility ${facilityId} and vehicle ${vehicleTypeId}: ${error}`
      );
      throw error;
    }
  }

  /**
   * Get facility by ID
   * @param facilityId Facility ID
   * @returns Facility data
   */
  private async getFacilityById(
    facilityId: string
  ): Promise<{ id: string; name: string; location: Position } | null> {
    try {
      const facility = await db.oneOrNone(
        `SELECT 
          id, name, 
          ST_X(location::geometry) as lng,
          ST_Y(location::geometry) as lat
        FROM facilities 
        WHERE id = $1`,
        [facilityId]
      );

      if (!facility) return null;

      return {
        id: facility.id,
        name: facility.name,
        location: {
          lat: facility.lat,
          lng: facility.lng,
        },
      };
    } catch (error) {
      logger.error(`Error fetching facility ${facilityId}: ${error}`);
      return null;
    }
  }

  /**
   * Get vehicle type by ID
   * @param vehicleTypeId Vehicle type ID
   * @returns Vehicle type data
   */
  private async getVehicleTypeById(
    vehicleTypeId: string
  ): Promise<{ id: string; name: string } | null> {
    try {
      const vehicleType = await db.oneOrNone(`SELECT id, name FROM vehicle_types WHERE id = $1`, [
        vehicleTypeId,
      ]);

      return vehicleType;
    } catch (error) {
      logger.error(`Error fetching vehicle type ${vehicleTypeId}: ${error}`);
      return null;
    }
  }

  /**
   * Check if a vehicle type is available at a facility
   * @param facilityId Facility ID
   * @param vehicleTypeId Vehicle type ID
   * @returns True if available
   */
  private async isVehicleAvailableAtFacility(
    facilityId: string,
    vehicleTypeId: string
  ): Promise<boolean> {
    try {
      const result = await db.oneOrNone(
        `SELECT id FROM vehicles WHERE facility_id = $1 AND vehicle_type_id = $2 AND count > 0`,
        [facilityId, vehicleTypeId]
      );

      return !!result;
    } catch (error) {
      logger.error(`Error checking vehicle availability: ${error}`);
      return false;
    }
  }

  /**
   * Clean up expired isochrones
   * @returns Number of deleted records
   */
  async cleanupExpiredIsochrones(): Promise<number> {
    return await isochroneRepos.cleanupExpiredIsochrones();
  }
}
