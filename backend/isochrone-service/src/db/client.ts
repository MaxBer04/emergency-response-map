import { Pool } from "pg";
import pgPromise from "pg-promise";
import config from "../config/index";
import logger from "../utils/logger";

// Create Postgres connection pool
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
});

// Log unexpected errors on idle clients
pool.on("error", (err) => {
  logger.error(`Unexpected error on idle client: ${err}`);
  process.exit(-1);
});

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  let client;
  try {
    client = await pool.connect();
    logger.info("Database connection successful");
    return true;
  } catch (error) {
    logger.error(`Database connection error: ${error}`);
    return false;
  } finally {
    if (client) client.release();
  }
};

// Initialize pg-promise with custom error handling
const pgp = pgPromise({
  error: (err, e) => {
    if (e.cn) {
      logger.error(`Connection error: ${err}`);
    } else if (e.query) {
      logger.error(`Query error: ${err}`);
    } else {
      logger.error(`Generic database error: ${err}`);
    }
  },
});

// Create database connection object
const db = pgp({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
});

export { pool, db };
