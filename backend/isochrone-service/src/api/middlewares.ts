import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/errors";

/**
 * Validates required fields in request body
 */
export const validateRequest = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return next(new BadRequestError(`Missing required field: ${field}`));
      }
    }
    next();
  };
};

/**
 * Validates isochrone calculation request
 */
export const validateIsochroneRequest = (req: Request, res: Response, next: NextFunction) => {
  const { facilityId, vehicleTypeId, timeWindow, trafficConditions } = req.body;

  // Check required fields
  if (!facilityId) {
    return next(new BadRequestError("Missing required field: facilityId"));
  }
  if (!vehicleTypeId) {
    return next(new BadRequestError("Missing required field: vehicleTypeId"));
  }
  if (!timeWindow) {
    return next(new BadRequestError("Missing required field: timeWindow"));
  }
  if (!trafficConditions) {
    return next(new BadRequestError("Missing required field: trafficConditions"));
  }

  // Validate time window (must be a positive number)
  if (typeof timeWindow !== "number" || timeWindow <= 0) {
    return next(new BadRequestError("timeWindow must be a positive number"));
  }

  // Validate traffic conditions
  if (typeof trafficConditions !== "object") {
    return next(new BadRequestError("trafficConditions must be an object"));
  }
  if (typeof trafficConditions.considerTraffic !== "boolean") {
    return next(new BadRequestError("trafficConditions.considerTraffic must be a boolean"));
  }

  // Validate time of day (if present)
  if (
    trafficConditions.timeOfDay &&
    !["current", "morning_rush", "evening_rush", "off_peak"].includes(trafficConditions.timeOfDay)
  ) {
    return next(
      new BadRequestError(
        "trafficConditions.timeOfDay must be one of: current, morning_rush, evening_rush, off_peak"
      )
    );
  }

  // Validate day type (if present)
  if (trafficConditions.dayType && !["weekday", "weekend"].includes(trafficConditions.dayType)) {
    return next(new BadRequestError("trafficConditions.dayType must be one of: weekday, weekend"));
  }

  next();
};

/**
 * Validates batch isochrone calculation request
 */
export const validateBatchIsochroneRequest = (req: Request, res: Response, next: NextFunction) => {
  const { facilities, timeWindows, trafficConditions } = req.body;

  // Check required fields
  if (!facilities || !Array.isArray(facilities) || facilities.length === 0) {
    return next(new BadRequestError("facilities must be a non-empty array"));
  }

  if (!timeWindows || !Array.isArray(timeWindows) || timeWindows.length === 0) {
    return next(new BadRequestError("timeWindows must be a non-empty array"));
  }

  if (!trafficConditions || typeof trafficConditions !== "object") {
    return next(new BadRequestError("trafficConditions must be an object"));
  }

  // Validate facilities array
  for (const facility of facilities) {
    if (!facility.id) {
      return next(new BadRequestError("Each facility must have an id"));
    }
    if (!facility.vehicles || !Array.isArray(facility.vehicles) || facility.vehicles.length === 0) {
      return next(new BadRequestError("Each facility must have a non-empty vehicles array"));
    }
  }

  // Validate time windows array (all must be positive numbers)
  for (const timeWindow of timeWindows) {
    if (typeof timeWindow !== "number" || timeWindow <= 0) {
      return next(new BadRequestError("All timeWindows must be positive numbers"));
    }
  }

  // Validate traffic conditions
  if (typeof trafficConditions.considerTraffic !== "boolean") {
    return next(new BadRequestError("trafficConditions.considerTraffic must be a boolean"));
  }

  next();
};
