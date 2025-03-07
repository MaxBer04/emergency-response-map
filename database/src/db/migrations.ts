import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./client";
import config from "../config/index";
import logger from "../utils/logger.js";

// /app directory (contains migrations, seeds and src)
const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../", "../");

interface Migration {
  id: number;
  name: string;
  filename: string;
  executed_at: Date | null;
}

export const ensureMigrationsTable = async (): Promise<void> => {
  try {
    await db.none(`
      CREATE TABLE IF NOT EXISTS ${config.migrations.tableName} (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE
      )
      `);
    logger.info(`Migration table ${config.migrations.tableName} ensured`);
  } catch (error) {
    logger.error({ err: error }, "Error ensuring migrations table");
    throw error;
  }
};

export const runMigrations = async (): Promise<void> => {
  await ensureMigrationsTable();

  try {
    const migrationsDir = path.resolve(__dirname, config.migrations.directory);
    logger.info(migrationsDir);

    // Check if directory exists
    try {
      await fs.access(migrationsDir);
    } catch (error) {
      logger.error({ err: error }, `Migrations directory does not exist: ${migrationsDir}`);
      throw new Error(`Migrations directory does not exist: ${migrationsDir}`);
    }

    let files = await fs.readdir(migrationsDir);

    // Filter SQL files and sort
    files = files.filter((file) => file.endsWith(".sql")).sort();

    if (files.length === 0) {
      logger.info("No migration files found.");
      return;
    }

    // Get executed Migrations
    const executedMigrations = await db.any<Migration>(
      `SELECT * FROM ${config.migrations.tableName} ORDER BY id`
    );
    const executedFilenames = new Set(executedMigrations.map((m) => m.filename));

    // Get outstanding migrations
    const pendingMigrations = files.filter((file) => !executedFilenames.has(file));

    if (pendingMigrations.length === 0) {
      logger.info("No pending migrations found. Database is up to date.");
      return;
    }

    logger.info(`Found ${pendingMigrations.length} pending migrations to execute.`);

    // Get outstanding migrations
    for (const file of pendingMigrations) {
      logger.info(`Running migration: ${file}`);

      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, "utf-8");

      // Execute migration as a transaction
      try {
        await db.tx(async (t) => {
          await t.none(sql);
          await t.none(
            `INSERT INTO ${config.migrations.tableName} (name, filename, executed_at) VALUES ($1, $2, NOW())`,
            [file.replace(".sql", ""), file]
          );
        });
        logger.info(`Migration completed: ${file}`);
      } catch (error) {
        logger.error({ err: error }, `Error executing migration: ${file}`);
        throw error;
      }
    }

    logger.info("All migrations have been executed");
  } catch (error) {
    logger.error({ err: error }, "Error running migrations");
    throw error;
  }
};

// Execute all seed files
export const runSeeds = async (): Promise<void> => {
  if (config.nodeEnv === "prod" && !config.seeds.runInProduction) {
    logger.warn("Seeding in production is disabled");
    return;
  }

  try {
    // Ensure seed tracking table exists
    await db.none(`
        CREATE TABLE IF NOT EXISTS seed_executions (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          filename VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

    // Read out seeds
    const seedsDir = path.resolve(__dirname, config.seeds.directory);

    // Check if directory exists
    try {
      await fs.access(seedsDir);
    } catch (error) {
      logger.error({ err: error }, `Seeds directory does not exist: ${seedsDir}`);
      throw new Error(`Seeds directory does not exist: ${seedsDir}`);
    }

    let files = await fs.readdir(seedsDir);
    files = files.filter((file) => file.endsWith(".sql")).sort();

    if (files.length === 0) {
      logger.info("No seed files found.");
      return;
    }

    // Get already executed seeds from DB
    const executedSeeds = await db.any<{ filename: string }>(
      "SELECT filename FROM seed_executions ORDER BY id"
    );
    const executedFilenames = new Set(executedSeeds.map((seed) => seed.filename));

    // Filter for pending seeds
    const pendingSeeds = files.filter((file) => !executedFilenames.has(file));

    if (pendingSeeds.length === 0) {
      logger.info("No pending seeds found. Database is up to date.");
      return;
    }

    logger.info(`Found ${pendingSeeds.length} pendings seeds to execute.`);

    for (const file of files) {
      logger.info(`Preparing to run seed: ${file}`);

      const filePath = path.join(seedsDir, file);
      const sql = await fs.readFile(filePath, "utf-8");

      // Log just the first 200 characters of SQL to avoid overwhelming logs
      const sqlPreview = sql.length > 200 ? sql.substring(0, 197) + "..." : sql;
      logger.info(`Seed file ${file} loaded (${sql.length} bytes): ${sqlPreview}`);

      try {
        // Execute seed within transaction
        await db.tx(async (t) => {
          logger.info(`Executing seed: ${file}`);
          await t.none(sql);

          // Mark seed as executed
          await t.none("INSERT INTO seed_executions (name, filename) VALUES ($1, $2)", [
            file.replace(".sql", ""),
            file,
          ]);
        });

        logger.info(`Seed completed successfully: ${file}`);
      } catch (error) {
        logger.error({ err: error }, `Error executing seed ${file}`);
        throw error;
      }
    }

    logger.info("All seeds have been executed");
  } catch (error) {
    logger.error({ err: error }, "Error running seeds");
    throw error;
  }
};
