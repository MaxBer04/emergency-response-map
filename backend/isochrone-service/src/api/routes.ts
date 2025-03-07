import express from "express";
import healthController from "./controllers/health";
import isochroneController from "./controllers/isochrone";
import { validateIsochroneRequest, validateBatchIsochroneRequest } from "./middlewares";

const router = express.Router();

// Health check route
router.get("/health", healthController.healthCheck);

// Isochrone routes
router.post("/calculate", validateIsochroneRequest, isochroneController.calculateIsochrone);
router.post("/batch", validateBatchIsochroneRequest, isochroneController.calculateBatchIsochrones);
router.get(
  "/facility/:facilityId/vehicle/:vehicleTypeId",
  isochroneController.getIsochroneByFacilityAndVehicle
);

export default router;
