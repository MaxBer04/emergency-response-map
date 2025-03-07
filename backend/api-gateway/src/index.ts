import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes for database service
app.use(
  "/api/db",
  createProxyMiddleware({
    target: "http://database-service:3010",
    changeOrigin: true,
  })
);

// Routes for isochrone service
app.use(
  "/api/isochrones",
  createProxyMiddleware({
    target: "http://isochrone-service:3020",
    changeOrigin: true,
  })
);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
