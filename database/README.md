# Database Microservice

Dieser Mikroservice ist verantwortlich für die Verwaltung der PostgreSQL/PostGIS-Datenbank, einschließlich Initialisierung, Migrationen und Seed-Daten. Er bildet die Grundlage für alle anderen Mikroservices.

## Projektstruktur

```bash
database-service/
├── Dockerfile
├── package.json
├── tsconfig.json
├── .env.example
├── migrations/
│   ├── 001_init_extensions.sql
│   ├── 002_create_regions.sql
│   ├── 003_create_facility_types.sql
│   ├── 004_create_facilities.sql
│   ├── 005_create_vehicle_types.sql
│   ├── 006_create_vehicles.sql
│   ├── 007_create_traffic_tables.sql
│   └── 008_create_isochrones.sql
├── seeds/
│   ├── 001_regions.sql
│   ├── 002_facility_types.sql
│   ├── 003_vehicle_types.sql
│   ├── 004_facilities.sql
│   └── 005_traffic_factors.sql
├── src/
│   ├── index.ts              # Haupteinstiegspunkt
│   ├── config/
│   │   └── index.ts          # Datenbank-Konfiguration
│   ├── db/
│   │   ├── client.ts         # Datenbankverbindung
│   │   └── migrations.ts     # Migrationslogik
│   ├── services/
│   │   ├── healthCheck.ts    # Gesundheitscheck-Service
│   │   └── migrationService.ts # Service für Datenbankmigrationen
│   ├── api/
│   │   ├── server.ts         # Express-Server
│   │   └── routes.ts         # API-Routen
│   └── utils/
│       └── logger.ts         # Logging-Utilities
└── k8s/
    └── database-service.yaml # Kubernetes-Deployment und Service
```

## Database Management with pgAdmin

### Setup and Access

#### Deploy pgAdmin to your Kubernetes cluster

```bash
kubectl apply -f k8s/pgadmin-deployment.yaml
```

#### Connecting to the Database

1. Right-click on "Servers" in the left panel and select "Create" → "Server"
2. On the "General" tab, enter "Emergency Response Map DB" as the name
3. On the "Connection" tab, enter:

- Host: postgres
- Port: 5432
- Maintenance database: emergency_response_map
- Username: postgres
- Password: somepassword

#### Using pgAdmin

- View tables: Navigate to Servers → Emergency Response Map DB → Databases → emergency_response_map → Schemas → public → Tables
- View table contents: Right-click any table → View/Edit Data → All Rows
- Run queries: Right-click on the database → Query ToolAccess pgAdming through port-forwarding:

```bash
kubectl port-forward svc/pgadmin 8080:80
```

#### Log in to the pgAdmin web interface

- Open `http://localhost:8080` in your browser
- Default credentials:
  - Email: admin@example.com
  - Password: pgadminpassword
