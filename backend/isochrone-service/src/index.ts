import { startServer } from "./api/server.js";
import { testConnection } from "./db/client.js";
import logger from "./utils/logger.js";
import isochroneRepo from "./db/repositories/isochroneRepos";

// Set up periodic cleanup of expired isochrones
const setupPeriodicCleanup = () => {
  const CLEANUP_INTERVAL = 3600000; // 1 hour in milliseconds

  setInterval(async () => {
    try {
      const deleted = await isochroneRepo.cleanupExpiredIsochrones();
      if (deleted > 0) {
        logger.info(`Cleaned up ${deleted} expired isochrones`);
      }
    } catch (error) {
      logger.error(`Error during isochrone cleanup: ${error}`);
    }
  }, CLEANUP_INTERVAL);

  logger.info(`Scheduled isochrone cleanup to run every ${CLEANUP_INTERVAL / 60000} minutes`);
};

// Main application entry point
const main = async () => {
  logger.info("Starting isochrone service");

  // Test database connection
  const connected = await testConnection();
  if (!connected) {
    logger.error("Could not connect to database. Exiting...");
    process.exit(1);
  }

  // Start server
  startServer();

  // Set up periodic cleanup
  setupPeriodicCleanup();
};

// Start the application
main().catch((error) => {
  logger.error("Unhandled error:", error);
  process.exit(1);
});
