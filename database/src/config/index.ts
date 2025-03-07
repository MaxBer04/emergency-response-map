export default {
  port: parseInt(process.env.PORT || "3010"),
  nodeEnv: process.env.NODE_ENV || "development",

  database: {
    host: process.env.DB_HOST || "postgres",
    port: parseInt(process.env.DB_PORT!),
    database: process.env.DB_DATABASE || "emergency_response_map",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "somepassword",
    ssl: process.env.DB_SSL === "true",
  },

  migrations: {
    directory: process.env.MIGRATIONS_DIR || "./migrations",
    tableName: process.env.MIGRATIONS_TABLE || "migrations",
  },

  seeds: {
    directory: process.env.SEEDS_DIR || "./seeds",
    runInProduction: process.env.RUN_SEEDS_IN_PRODUCTION === "true",
  },
};
