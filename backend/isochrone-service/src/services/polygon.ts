import * as turf from "@turf/turf";
import { GridPoint, Polygon } from "../models/isochrone";
import config from "../config/index";
import logger from "../utils/logger";

/**
 * Service for generating and manipulating polygons from grid points
 */
export default class PolygonService {
  /**
   * Generate a polygon from grid points
   * @param gridPoints Grid points that are reachable
   * @param smoothingFactor Smoothing factor (0-1, higher means smoother)
   * @returns GeoJSON polygon
   */
  static generatePolygon(
    gridPoints: GridPoint[],
    smoothingFactor: number = config.isochrone.smoothingFactor
  ): Polygon {
    try {
      // Convert grid points to GeoJSON points
      const points = gridPoints.map((point) =>
        turf.point([point.position.lng, point.position.lat])
      );

      // Create a feature collection from points
      const featureCollection = turf.featureCollection(points);

      // Generate a concave hull (appropriate for isochrones)
      // The maxEdge parameter controls the level of detail
      // We calculate it based on the average distance between points
      const concave = turf.concave(featureCollection, {
        maxEdge: this.calculateMaxEdge(gridPoints),
        units: "kilometers",
      });

      // If concave hull generation fails, fall back to a convex hull
      if (!concave) {
        logger.warn("Concave hull generation failed, falling back to convex hull");
        const convex = turf.convex(featureCollection);
        if (!convex) {
          throw new Error("Failed to generate hull polygon");
        }
        return convex.geometry as Polygon;
      }

      // Smooth the polygon if desired
      if (smoothingFactor > 0) {
        return this.smoothPolygon(concave.geometry as Polygon, smoothingFactor);
      }

      return concave.geometry as Polygon;
    } catch (error) {
      logger.error(`Error generating polygon: ${error}`);
      // If all else fails, create a minimal convex hull as fallback
      const points = gridPoints.map((point) => [point.position.lng, point.position.lat]);

      // Create a simple convex hull
      const hull = turf.convex(turf.points(points));
      return hull!.geometry as Polygon;
    }
  }

  /**
   * Calculate the max edge length for concave hull based on point distribution
   * @param gridPoints Grid points
   * @returns Max edge length in kilometers
   */
  private static calculateMaxEdge(gridPoints: GridPoint[]): number {
    if (gridPoints.length < 2) return 1.0;

    // Sample a subset of points for efficiency
    const sampleSize = Math.min(100, gridPoints.length);
    const sample = [];
    for (let i = 0; i < sampleSize; i++) {
      const index = Math.floor(Math.random() * gridPoints.length);
      sample.push(gridPoints[index]);
    }

    // Calculate distances between pairs of points
    const distances = [];
    for (let i = 0; i < sample.length; i++) {
      for (let j = i + 1; j < sample.length; j++) {
        const p1 = sample[i].position;
        const p2 = sample[j].position;
        const distance = turf.distance([p1.lng, p1.lat], [p2.lng, p2.lat], { units: "kilometers" });
        distances.push(distance);
      }
    }

    // Calculate the average distance
    const averageDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

    // Return a max edge length based on the average distance
    // Multiply by a factor to get appropriate detail level
    return averageDistance * 3;
  }

  /**
   * Smooth a polygon using the Chaikin algorithm
   * @param polygon Input polygon
   * @param smoothingFactor Smoothing factor
   * @returns Smoothed polygon
   */
  private static smoothPolygon(polygon: Polygon, smoothingFactor: number): Polygon {
    // Ensure we have a valid polygon
    if (!polygon || !polygon.coordinates || polygon.coordinates.length === 0) {
      return polygon;
    }

    // Determine number of iterations based on smoothing factor
    const iterations = Math.round(smoothingFactor * 3);

    // Apply Chaikin smoothing algorithm
    let smoothed = polygon;
    for (let i = 0; i < iterations; i++) {
      smoothed = this.applyChaikinSmoothing(smoothed);
    }

    return smoothed;
  }

  /**
   * Apply one iteration of Chaikin smoothing to a polygon
   * @param polygon Input polygon
   * @returns Smoothed polygon
   */
  private static applyChaikinSmoothing(polygon: Polygon): Polygon {
    const result: Polygon = {
      type: "Polygon",
      coordinates: [],
    };

    // Process each ring of the polygon
    for (const ring of polygon.coordinates) {
      if (ring.length <= 2) {
        result.coordinates.push([...ring]);
        continue;
      }

      const smoothedRing = [];

      // Process each pair of consecutive points
      for (let i = 0; i < ring.length - 1; i++) {
        const p0 = ring[i];
        const p1 = ring[i + 1];

        // Calculate 1/4 and 3/4 points between p0 and p1
        const q0 = [p0[0] * 0.75 + p1[0] * 0.25, p0[1] * 0.75 + p1[1] * 0.25];

        const q1 = [p0[0] * 0.25 + p1[0] * 0.75, p0[1] * 0.25 + p1[1] * 0.75];

        smoothedRing.push(q0);
        smoothedRing.push(q1);
      }

      // Close the ring by connecting back to the start
      if (ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]) {
        const p0 = ring[ring.length - 1];
        const p1 = ring[0];

        const q0 = [p0[0] * 0.75 + p1[0] * 0.25, p0[1] * 0.75 + p1[1] * 0.25];

        const q1 = [p0[0] * 0.25 + p1[0] * 0.75, p0[1] * 0.25 + p1[1] * 0.75];

        smoothedRing.push(q0);
        smoothedRing.push(q1);
      }

      // Close the smoothed ring
      smoothedRing.push([...smoothedRing[0]]);

      result.coordinates.push(smoothedRing);
    }

    return result;
  }

  /**
   * Calculate metadata for a polygon
   * @param polygon GeoJSON polygon
   * @param center Center point of reference
   * @returns Object with area and max distance
   */
  static calculateMetadata(
    polygon: Polygon,
    center: [number, number]
  ): { area_km2: number; max_distance_km: number } {
    // Create a turf polygon for calculations
    const turfPolygon = turf.polygon(polygon.coordinates);

    // Calculate area in square kilometers
    const area = turf.area(turfPolygon) / 1000000; // Convert from sq meters to sq km

    // Calculate max distance from center to any point on the boundary
    const boundary = turf.lineString(polygon.coordinates[0]);
    const points = turf.explode(boundary);

    let maxDistance = 0;
    for (const point of points.features) {
      const distance = turf.distance(center, point, { units: "kilometers" });
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    }

    return {
      area_km2: area,
      max_distance_km: maxDistance,
    };
  }
}
