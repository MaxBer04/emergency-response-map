import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import pino from "pino";
import routes from "./routes";
import logger from "../utils/logger";
import config from "../config/index";
import { AppError } from "../utils/errors";

// Create Express application
export const createServer = () => {
  const app = express();

  // Apply middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Logging middleware
  app.use(
    pinoHttp({
      logger,
      customProps: () => {
        return {
          service: "isochrone-service",
        };
      },
      customLogLevel: (req, res, err) => {
        if (req.url.includes("/health")) {
          // Only log health checks at 'trace' level (unless they fail)
          return res.statusCode >= 400 ? "warn" : "trace";
        }
        if (res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
      // Optional: Customize what gets logged for different endpoints
      customSuccessMessage: (req, res) => {
        if (req.url.includes("/health")) {
          return "Health check OK";
        }
        return `${req.method} ${req.url} completed`;
      },
      customErrorMessage: (req, res, err) => {
        return `${req.method} ${req.url} failed: ${err.message}`;
      },
      // Optional: Customize what fields get included in logs
      serializers: {
        req: (req) => {
          // For health checks, return minimal info
          if (req.url.includes("/health")) {
            return {
              method: req.method,
              url: req.url,
            };
          }
          // For other requests, return standard info
          return pino.stdSerializers.req(req);
        },
      },
    })
  );

  // API routes
  app.use("/api/isochrones", routes);

  // 404 handler
  app.use((req: express.Request, res: express.Response) => {
    res.status(404).json({
      status: "error",
      message: `Route not found: ${req.method} ${req.path}`,
    });
  });

  // Error handler
  app.use(
    (
      err: Error | AppError,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      let statusCode = 500;
      let errorMessage = "Internal Server Error";
      let isOperational = false;

      if (err instanceof AppError) {
        statusCode = err.statusCode;
        errorMessage = err.message;
        isOperational = err.isOperational;
      }

      // Log error
      if (!isOperational) {
        logger.error(err);
      } else {
        logger.warn({ err }, errorMessage);
      }

      // Send response
      res.status(statusCode).json({
        status: "error",
        message: errorMessage,
      });
    }
  );

  return app;
};

// Start server
export const startServer = () => {
  const app = createServer();

  const server = app.listen(config.port, () => {
    logger.info(`Isochrone service running on port ${config.port}`);
  });

  // Graceful shutdown
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
