import { Request, Response } from "express";
import { db } from "../db/client";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";

export const getVehicleTypes = async (req: Request, res: Response) => {
  try {
    // Get the facility type ID from the query params
    const facilityTypeId = req.query.facilityType as string;

    // Check if facility type ID is provided
    if (!facilityTypeId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Facility type ID (facilityType) is required",
      });
    }

    const vehicleTypes = await db.any(
      `
      SELECT
        id,
        code,
        facility_type_id,
        name,
        description,
        icon_url,
        highway_speed,
        rural_speed,
        urban_speed,
        response_time
      FROM vehicle_types
      WHERE facility_type_id = $1
      ORDER BY name
      `,
      [facilityTypeId]
    );

    // Transform the data to match the expected format in the frontend
    const transformedVehicleTypes = vehicleTypes.map((vt) => ({
      id: vt.id,
      code: vt.code,
      facility_type_id: vt.facility_type_id,
      name: vt.name,
      description: vt.description,
      icon_url: vt.icon_url,
      highway_sped: vt.highway_speed,
      rural_speed: vt.rural_speed,
      urban_speed: vt.urban_speed,
      response_time: vt.response_time,
    }));

    return res.json({
      vehicle_types: transformedVehicleTypes,
    });
  } catch (err) {
    logger.error({ err }, "Error fetching vehicle types");
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "Error",
      message: "Error fetching vehicle types",
    });
  }
};
