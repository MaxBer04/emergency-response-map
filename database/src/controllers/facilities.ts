import { Request, Response } from "express";
import { db } from "../db/client";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";

export const getFacilities = async (req: Request, res: Response) => {
  try {
    // Get query parameters for filtering
    const facilityTypeId = req.query.type as string;
    const regionId = req.query.region as string;

    let query = `
      SELECT
        f.id,
        f.facility_type_id,
        f.name,
        f.address,
        ST_X(f.location::geometry) as lng,
        ST_Y(f.location::geometry) as lat,
        f.phone,
        f.email,
        f.website
      FROM facilities f
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    // Add facility type filter if present
    if (facilityTypeId) {
      params.push(facilityTypeId);
      conditions.push(`f.facility_type_id = $${params.length}`);
    }

    // Add region filter if present
    if (regionId) {
      params.push(regionId);
      conditions.push(
        `ST_Intersects(f.location, (SELECT bounds FROM regions WHERE id = $${params.length}))`
      );
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY f.name`;

    const facilities = await db.any(query, params);

    const transformedFacilities = facilities.map((facility) => ({
      id: facility.id,
      facility_type_id: facility.facility_type_id,
      name: facility.name,
      address: facility.address,
      location: {
        lat: facility.lat,
        lng: facility.lng,
      },
      contact: {
        phone: facility.phone,
        email: facility.email,
        website: facility.website,
      },
    }));

    return res.json({
      facilities: transformedFacilities,
    });
  } catch (err) {
    logger.error({ err }, "Error fetching facilities");
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Error fetching facilities",
    });
  }
};

export const getFacilityById = async (req: Request, res: Response) => {
  try {
    const facilityId = req.params.id;

    const facility = await db.oneOrNone(
      `
        SELECT
          f.id,
          f.facility_type_id,
          ft.name as facility_type_name,
          f.name,
          f.address,
          ST_X(f.location::geometry) as lng,
          ST_Y(f.location::geometry) as lat,
          f.phone,
          f.email,
          f.website
        FROM facilities f
        JOIN facility_types ft ON f.facility_type_id = ft.id
        WHERE f.id = $1
      `,
      [facilityId]
    );

    if (!facility) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: `Facility with ID ${facilityId} not found`,
      });
    }

    const vehicles = await db.any(
      `
          SELECT
            v.id,
            v.vehicle_type_id,
            vt.name as vehicle_type_name,
            v.count
          FROM vehicles v
          JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
          WHERE v.facility_id = $1
        `,
      [facilityId]
    );

    const transformedFacility = {
      id: facility.id,
      facility_type_id: facility.facility_type_id,
      facility_type_name: facility.facility_type_name,
      name: facility.name,
      address: facility.address,
      location: {
        lat: facility.lat,
        lng: facility.lng,
      },
      contact: {
        phone: facility.phone,
        email: facility.email,
        website: facility.website,
      },
      vehicles: vehicles.map((v) => ({
        vehicle_type_id: v.vehicle_type_id,
        vehicle_type_name: v.vehicle_type_name,
        count: v.count,
      })),
    };

    return res.json({
      facility: transformedFacility,
    });
  } catch (err) {
    logger.error({ err }, `Error fetching facility with ID ${req.params.id}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Error fetching facility details",
    });
  }
};
