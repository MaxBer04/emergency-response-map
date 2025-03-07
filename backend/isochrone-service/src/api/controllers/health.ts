import { Request, Response, NextFunction } from "express";
import { testConnection } from "../../db/client";
import { Client } from "@googlemaps/google-maps-services-js";
import config from "../../config/index";
import logger from "../../utils/logger";

/**
 * Health check controller
 */
export default {
  /**
   * GET /health - Service health check
   */
  async healthCheck(req: Request, res: Response, next: NextFunction) {
    try {
      // Check database connection
      const dbConnected = await testConnection();

      // Check Google Maps API connection
      let googleMapsConnected = false;

      try {
        const client = new Client({});
        await client.elevation({
          params: {
            locations: [{ lat: 39.7391536, lng: -104.9847034 }],
            key: config.googleMaps.apiKey,
          },
          timeout: config.googleMaps.timeoutMs,
        });
        googleMapsConnected = true;
      } catch (error) {
        logger.warn(`Google Maps API connection test failed: ${error}`);
      }

      // Determine overall status
      const status = dbConnected && googleMapsConnected ? "healthy" : "unhealthy";

      return res.json({
        status,
        version: process.env.npm_package_version || "unknown",
        details: {
          database: dbConnected,
          googleMapsApi: googleMapsConnected,
          uptime: process.uptime(),
          environment: config.nodeEnv,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
