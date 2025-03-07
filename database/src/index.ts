import { startServer } from "./api/server.js";
import MigrationService from "./services/migrationService";
import logger from "./utils/logger.js";
import { testConnection } from "./db/client.js";

const main = async () => {
  logger.info("Starting database service");

  const connected = await testConnection();
  if (!connected) {
    logger.error("Could not connect to database. Exiting...");
    process.exit(1);
  }

  const args = process.argv.slice(2);

  if (args.includes("migrate")) {
    // Execute migrations

    await MigrationService.migrate();
    logger.info("Migrations completed. Exiting...");
    process.exit(0);
  } else if (args.includes("seed")) {
    // Execute seeding

    await MigrationService.seed();
    logger.info("Seeds completed. Exiting...");
    process.exit(0);
  } else {
    // Execute full service
    try {
      await MigrationService.setup();

      startServer();
    } catch (error) {
      logger.error("Error starting service:", error);
      process.exit(1);
    }
  }
};

main().catch((error) => {
  logger.error("Unhandeled error:", error);
  process.exit(1);
});
