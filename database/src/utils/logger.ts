import pino from "pino";
import config from "../config/index.js";

// Define the configuration type with all possible properties
const loggerConfig: pino.LoggerOptions = {
  level: config.nodeEnv === "prod" ? "info" : "debug",

  redact: ["password", "secret", "key"],

  transport:
    config.nodeEnv !== "prod"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
            messageFormat: "{msg}",
            singleLine: true,
          },
        }
      : undefined,
};

// Logger-Instanz erstellen
const logger = pino(loggerConfig);

export default logger;
