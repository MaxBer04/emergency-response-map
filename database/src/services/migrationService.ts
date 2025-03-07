// database/src/services/migrationService.ts
import { runMigrations, runSeeds } from "../db/migrations";
import { db } from "../db/client";
import logger from "../utils/logger";

export default class MigrationService {
  static async migrate(): Promise<void> {
    try {
      logger.info("Starting database migrations");
      try {
        await runMigrations();
        logger.info("Database migrations completed successfully");
      } catch (err) {
        // Proper error logging
        logger.error({ err }, "Error during database migrations");
        throw err;
      }
    } catch (err) {
      logger.error({ err }, "Error during database migrations");
      throw err;
    }
  }

  static async seed(): Promise<void> {
    try {
      logger.info("Starting database seeding");
      await runSeeds();
      logger.info("Database seeding completed successfully");
    } catch (err) {
      logger.error({ err }, "Error during database seeding");
      throw err;
    }
  }

  /**
   * Checks if database needs initialization (migrations/seeds)
   * @returns true if database is empty or has no facility_types
   */
  static async needsInitialization(): Promise<boolean> {
    try {
      // Check if facility_types table exists and has data
      const result = await db.oneOrNone(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'facility_types'
        ) AS table_exists;
      `);

      if (!result || !result.table_exists) {
        logger.info("Database needs initialization: facility_types table doesn't exist");
        return true;
      }

      // Check if there's data in facility_types
      const hasData = await db.oneOrNone(`
        SELECT EXISTS (
          SELECT 1 FROM facility_types LIMIT 1
        ) AS has_data;
      `);

      if (!hasData || !hasData.has_data) {
        logger.info("Database needs initialization: facility_types table is empty");
        return true;
      }

      logger.info("Database already initialized with data");
      return false;
    } catch (error) {
      logger.error({ err: error }, "Error checking database initialization status");
      // If we can't determine, assume it needs initialization
      return true;
    }
  }

  static async setup(): Promise<void> {
    try {
      await this.migrate();
      await this.seed();
    } catch (err) {
      logger.error({ err }, "Database setup failed");
      throw err;
    }
  }
}
