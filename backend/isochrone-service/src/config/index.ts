export default {
  port: parseInt(process.env.PORT || "3020"),
  nodeEnv: process.env.NODE_ENV || "dev",

  // Database configuration
  database: {
    host: process.env.DB_HOST || "postgres",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_DATABASE || "emergency_response_map",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "somepassword",
    ssl: process.env.DB_SSL === "true",
  },

  // Google Maps API configuration
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || "",
    timeoutMs: parseInt(process.env.GOOGLE_MAPS_TIMEOUT_MS || "5000"),
  },

  // Isochrone calculation configuration
  isochrone: {
    // Maximum grid radius in kilometers
    maxGridRadius: parseFloat(process.env.ISOCHRONE_MAX_GRID_RADIUS || "30"),
    // Grid resolution - points per km in each direction
    gridResolution: parseFloat(process.env.ISOCHRONE_GRID_RESOLUTION || "3"),
    // Cache duration in seconds
    cacheDuration: parseInt(process.env.ISOCHRONE_CACHE_DURATION || "3600"),
    // Maximum batch size for distance matrix API
    maxBatchSize: parseInt(process.env.ISOCHRONE_MAX_BATCH_SIZE || "25"),
    // Smoothing factor for polygon generation (0-1)
    smoothingFactor: parseFloat(process.env.ISOCHRONE_SMOOTHING_FACTOR || "0.3"),
  },
};
