import { Request, Response } from "express";
import { db } from "../db/client";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";

export const getFacilityTypes = async (req: Request, res: Response) => {
  try {
    const facilityTypes = await db.any(`
      SELECT
        id,
        code,
        name,
        description,
        icon_url
      FROM facility_types
      ORDER BY name
      `);

    return res.json({
      facility_types: facilityTypes,
    });
  } catch (err) {
    logger.error({ err }, "Error fetching facility types");
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Error fetching facility types",
    });
  }
};
