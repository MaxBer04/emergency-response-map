# Isochrone Service Directory Structure

```
isochrone-service/
├── src/
│   ├── index.ts                   # Entry point
│   ├── config/
│   │   └── index.ts               # Configuration management
│   ├── api/
│   │   ├── server.ts              # Express server setup
│   │   ├── routes.ts              # API route definitions
│   │   ├── middlewares.ts         # Express middlewares
│   │   └── controllers/
│   │       ├── isochrone.ts       # Isochrone controller
│   │       └── health.ts          # Health check controller
│   ├── services/
│   │   ├── isochrone.ts           # Isochrone calculation service
│   │   ├── grid.ts                # Grid point generation service
│   │   ├── distance.ts            # Distance matrix service (Google Maps)
│   │   └── polygon.ts             # Polygon generation service
│   ├── models/
│   │   ├── isochrone.ts           # Isochrone model
│   │   ├── facilities.ts          # Facility model
│   │   └── vehicles.ts            # Vehicle model
│   ├── db/
│   │   ├── client.ts              # Database client
│   │   └── repositories/
│   │       └── isochroneRepo.ts   # Isochrone repository
│   └── utils/
│       ├── logger.ts              # Logging utility
│       └── errors.ts              # Error handling utility
├── Dockerfile                     # Docker configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Project dependencies
└── k8s/                           # Kubernetes configuration
    └── isochrone-service.yaml     # K8s deployment and service
```
