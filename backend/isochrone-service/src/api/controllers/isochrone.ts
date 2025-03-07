import { Request, Response, NextFunction } from "express";
import IsochroneService from "../../services/isochrone";
import { IsochroneRequest, BatchIsochroneRequest } from "../../models/isochrone";
import logger from "../../utils/logger";
import { NotFoundError } from "../../utils/errors";

// Create instance of isochrone service
const isochroneService = new IsochroneService();

/**
 * Isochrone controller
 */
export default {
  /**
   * POST /isochrones/calculate - Calculate a single isochrone
   */
  async calculateIsochrone(req: Request, res: Response, next: NextFunction) {
    try {
      const request: IsochroneRequest = {
        facilityId: req.body.facilityId,
        vehicleTypeId: req.body.vehicleTypeId,
        timeWindow: req.body.timeWindow,
        trafficConditions: req.body.trafficConditions,
      };

      logger.info(
        `Calculating isochrone for facility ${request.facilityId}, vehicle ${request.vehicleTypeId}`
      );
      const isochrone = await isochroneService.calculateIsochrone(request);

      return res.json({
        status: "success",
        data: isochrone,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /isochrones/batch - Calculate multiple isochrones
   */
  async calculateBatchIsochrones(req: Request, res: Response, next: NextFunction) {
    try {
      const request: BatchIsochroneRequest = {
        facilities: req.body.facilities,
        timeWindows: req.body.timeWindows,
        trafficConditions: req.body.trafficConditions,
      };

      logger.info(`Calculating batch isochrones for ${request.facilities.length} facilities`);
      const isochrones = await isochroneService.calculateBatchIsochrones(request);

      return res.json({
        status: "success",
        data: isochrones,
        count: isochrones.length,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /isochrones/facility/:facilityId/vehicle/:vehicleTypeId - Get isochrones by facility and vehicle
   */
  async getIsochroneByFacilityAndVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { facilityId, vehicleTypeId } = req.params;

      logger.info(`Getting isochrones for facility ${facilityId} and vehicle ${vehicleTypeId}`);
      const isochrones = await isochroneService.getIsochronesByFacilityAndVehicle(
        facilityId,
        vehicleTypeId
      );

      if (isochrones.length === 0) {
        throw new NotFoundError(
          `No isochrones found for facility ${facilityId} and vehicle ${vehicleTypeId}`
        );
      }

      return res.json({
        status: "success",
        data: isochrones,
        count: isochrones.length,
      });
    } catch (error) {
      next(error);
    }
  },
};
