import { testConnection } from "../db/client.js";
import logger from "../utils/logger.js";

export const healthCheck = async (): Promise<{
  status: "healthy" | "unhealthy";
  details: {
    database: boolean;
    uptime: number;
  };
}> => {
  logger.debug("Running health check");

  const dbConnected = await testConnection();

  const status = dbConnected ? "healthy" : "unhealthy";

  return {
    status,
    details: {
      database: dbConnected,
      uptime: process.uptime(),
    },
  };
};
