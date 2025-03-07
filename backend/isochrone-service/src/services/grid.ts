import * as turf from "@turf/turf";
import { Position, GridPoint } from "../models/isochrone";
import config from "../config/index";

/**
 * Service for generating grid points for isochrone calculation
 */
export default class GridService {
  /**
   * Generate grid points around a center location
   * @param center Center position
   * @param radiusKm Maximum radius in kilometers
   * @param resolution Points per kilometer
   * @returns Array of grid points
   */
  static generateGridPoints(
    center: Position,
    radiusKm: number = config.isochrone.maxGridRadius,
    resolution: number = config.isochrone.gridResolution
  ): GridPoint[] {
    // Create a point feature for the center location
    const centerPoint = turf.point([center.lng, center.lat]);

    // Define the bounding box for the grid
    // We create a square that's 2x the radius, centered on the point
    const diagonal = Math.sqrt(2) * radiusKm;
    const bbox = turf.bbox(turf.buffer(centerPoint, diagonal, { units: "kilometers" }));

    // Calculate distances between grid points based on resolution
    const cellSize = 1 / resolution;

    // Create a grid of points
    const grid = turf.pointGrid(bbox, cellSize, { units: "kilometers" });

    // Filter out points that are outside our radius
    const filteredPoints = grid.features.filter((point) => {
      const distance = turf.distance(centerPoint, point, { units: "kilometers" });
      return distance <= radiusKm;
    });

    // Convert to our GridPoint format
    return filteredPoints.map((point) => ({
      position: {
        lat: point.geometry.coordinates[1],
        lng: point.geometry.coordinates[0],
      },
    }));
  }

  /**
   * Create multiple batches of grid points for processing
   * @param gridPoints All grid points
   * @param batchSize Maximum batch size
   * @returns Array of grid point batches
   */
  static createBatches(
    gridPoints: GridPoint[],
    batchSize: number = config.isochrone.maxBatchSize
  ): GridPoint[][] {
    const batches: GridPoint[][] = [];
    for (let i = 0; i < gridPoints.length; i += batchSize) {
      batches.push(gridPoints.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Filter grid points based on travel time
   * @param gridPoints Grid points with travel times
   * @param timeWindowMinutes Maximum travel time in minutes
   * @returns Filtered grid points that are reachable within the time window
   */
  static filterByTravelTime(gridPoints: GridPoint[], timeWindowMinutes: number): GridPoint[] {
    const timeWindowSeconds = timeWindowMinutes * 60;
    return gridPoints
      .map((point) => ({
        ...point,
        reachable: point.travelTime !== undefined && point.travelTime <= timeWindowSeconds,
      }))
      .filter((point) => point.reachable);
  }
}
