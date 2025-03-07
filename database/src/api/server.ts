import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import routes from "./routes.js";
import logger from "../utils/logger.js";
import config from "../config/index";

// Express-App erstellen
export const createServer = () => {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Logging-Middleware
  app.use(
    pinoHttp({
      logger,
      customProps: () => {
        return {
          service: "database-service",
        };
      },
    })
  );

  // Routen
  app.use("/api/db", routes);

  // 404-Behandlung
  app.use((req: express.Request, res: express.Response) => {
    res.status(404).json({
      status: "error",
      message: `Route not found: ${req.method} ${req.path}`,
    });
  });

  // Fehlerbehandlung
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  });

  return app;
};

// Server starten
export const startServer = () => {
  const app = createServer();

  const server = app.listen(config.port, () => {
    logger.info(`Database service running on port ${config.port}`);
  });

  // Graceful Shutdown
  const shutdown = () => {
    logger.info("Shutting down server...");
    server.close(() => {
      logger.info("Server shut down successfully");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return server;
};
