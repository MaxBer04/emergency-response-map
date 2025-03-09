import express from "express";
import { healthCheck } from "../services/healthCheck";
import { StatusCodes } from "http-status-codes";
import MigrationService from "../services/migrationService";
import logger from "../utils/logger.js";
import * as facilityTypesController from "../controllers/facilityTypes";
import * as facilitiesController from "../controllers/facilities";
import * as vehicleTypesController from "../controllers/vehicleTypes";

const router = express.Router();

router.get("/health", async (req: express.Request, res: express.Response) => {
  try {
    const health = await healthCheck();

    if (health.status === "unhealthy") {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json(health);
    }

    return res.json(health);
  } catch (error) {
    logger.error("Health check error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Error performing health check",
    });
  }
});

router.post("/migrate", async (req: express.Request, res: express.Response) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: "error",
      message: "Migrations endpoint is disabled in production",
    });
  }

  try {
    await MigrationService.migrate();
    return res.json({
      status: "success",
      message: "Migrations completed successfully",
    });
  } catch (error) {
    logger.error("Migration error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Error running migrations",
    });
  }
});

router.post("/seed", async (req: express.Request, res: express.Response) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: "error",
      message: "Seed endpoint is disabled in production",
    });
  }

  try {
    await MigrationService.seed();
    return res.json({
      status: "success",
      message: "Seeds completed successfully",
    });
  } catch (error) {
    logger.error("Seed error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Error running seeds",
    });
  }
});

router.get("/facility-types", facilityTypesController.getFacilityTypes);
router.get("/facilities", facilitiesController.getFacilities);
router.get("/facilites/:id", facilitiesController.getFacilityById);

router.get("/vehicle-types", vehicleTypesController.getVehicleTypes);

export default router;
