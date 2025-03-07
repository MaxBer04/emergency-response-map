import { Client, TravelMode, TrafficModel } from "@googlemaps/google-maps-services-js";
import { Position, GridPoint, TrafficConditions } from "../models/isochrone";
import config from "../config/index";
import logger from "../utils/logger";
import { ExternalAPIError } from "../utils/errors";

/**
 * Service for handling distance and travel time calculations using Google Maps API
 */
export default class DistanceService {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  /**
   * Get travel times from origin to multiple destinations
   * @param origin Starting position
   * @param destinations Array of destination positions
   * @param trafficConditions Traffic conditions to consider
   * @returns Array of travel times in seconds (null for unreachable points)
   */
  async getTravelTimes(
    origin: Position,
    destinations: Position[],
    trafficConditions: TrafficConditions
  ): Promise<number[]> {
    try {
      // Format destinations for the API as LatLng objects
      const destinationLatLngs = destinations.map((dest) => ({
        lat: dest.lat,
        lng: dest.lng,
      }));

      // Determine traffic model based on conditions
      let trafficModel: TrafficModel | undefined = undefined;
      if (trafficConditions.considerTraffic) {
        if (trafficConditions.timeOfDay === "morning_rush") {
          trafficModel = TrafficModel.best_guess;
        } else if (trafficConditions.timeOfDay === "evening_rush") {
          trafficModel = TrafficModel.pessimistic;
        } else if (trafficConditions.timeOfDay === "off_peak") {
          trafficModel = TrafficModel.optimistic;
        }
      }

      // Call Distance Matrix API
      const response = await this.client.distancematrix({
        params: {
          origins: [`${origin.lat},${origin.lng}`],
          destinations: destinationLatLngs,
          mode: TravelMode.driving,
          traffic_model: trafficModel,
          departure_time: trafficConditions.considerTraffic ? new Date() : undefined,
          key: config.googleMaps.apiKey,
        },
        timeout: config.googleMaps.timeoutMs,
      });

      // Check response status
      if (response.data.status !== "OK") {
        throw new ExternalAPIError(`Distance Matrix API error: ${response.data.status}`);
      }

      // Extract travel times
      const travelTimes = response.data.rows[0].elements.map((element) => {
        if (element.status === "OK") {
          return element.duration.value; // Duration in seconds
        }
        return Infinity; // Points that are unreachable get inifinity as a sentinel value
      });

      return travelTimes;
    } catch (error) {
      logger.error(`Error getting travel times: ${error}`);
      throw new ExternalAPIError(`Error getting travel times: ${error}`);
    }
  }

  /**
   * Calculate travel times for a batch of grid points
   * @param origin Starting position
   * @param gridPoints Array of grid points
   * @param trafficConditions Traffic conditions to consider
   * @returns Array of grid points with travel times populated
   */
  async calculateTravelTimes(
    origin: Position,
    gridPoints: GridPoint[],
    trafficConditions: TrafficConditions
  ): Promise<GridPoint[]> {
    // Extract destination positions
    const destinations = gridPoints.map((point) => point.position);

    // Get travel times
    const travelTimes = await this.getTravelTimes(origin, destinations, trafficConditions);

    // Combine grid points with travel times
    return gridPoints.map((point, index) => ({
      ...point,
      travelTime: travelTimes[index],
    }));
  }

  /**
   * Process multiple batches of grid points
   * @param origin Starting position
   * @param gridBatches Array of grid point batches
   * @param trafficConditions Traffic conditions to consider
   * @returns All grid points with travel times populated
   */
  async processBatches(
    origin: Position,
    gridBatches: GridPoint[][],
    trafficConditions: TrafficConditions
  ): Promise<GridPoint[]> {
    const results: GridPoint[] = [];

    // Process each batch
    for (const batch of gridBatches) {
      const batchResults = await this.calculateTravelTimes(origin, batch, trafficConditions);
      results.push(...batchResults);

      // Add a small delay between batches to avoid API rate limits
      if (gridBatches.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    return results;
  }
}
