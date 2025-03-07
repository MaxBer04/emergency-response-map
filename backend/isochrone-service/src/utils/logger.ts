import pino from "pino";
import config from "../config/index.js";

// Configure logger based on environment
const loggerConfig = {
  level: config.nodeEnv === "prod" ? "info" : "debug",
  transport: config.nodeEnv !== "prod" ? { target: "pino-pretty" } : undefined,
};

// Create logger instance
const logger = pino(loggerConfig);

export default logger;
