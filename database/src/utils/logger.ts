import pino from "pino";
import config from "../config/index.js";

// Define the configuration type with all possible properties
const loggerConfig: pino.LoggerOptions = {
  level: config.nodeEnv === "prod" ? "info" : "debug",
};

// Add transport only in development mode
if (config.nodeEnv !== "prod") {
  loggerConfig.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  };
}

// Logger-Instanz erstellen
const logger = pino(loggerConfig);

export default logger;
