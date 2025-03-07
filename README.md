# Emergency Response Map API Documentation

## Overview

The Emergency Response Map API enables visualization of accessibility areas (isochrones) for emergency services such as fire departments, police, and other rescue services. The API provides functions for retrieving facilities, vehicle types, and calculating accessibility areas considering realistic traffic conditions.

## Getting Started with Development

To start the Emergency Response Map project in development mode, first ensure you have Docker Desktop with Kubernetes enabled and Bun installed. Clone the repository and navigate to the project root. Run `npm install` to install dependencies. Next, build the Docker images with

```bash
docker build -t emergency-response-map/frontend:latest ./frontend
docker build -t emergency-response-map/api-gateway:latest ./backend/api-gateway
docker build -t emergency-response-map/isochrone-service:latest ./backend/isochrone-service
docker build -t emergency-response-map/database-service:latest ./database
```

Then start the development environment by running:

```bash
npm run dev
```

Finally, access the application by forwarding the frontend service port with:

```bash
npm run watch
```

The application will hot reload as you make changes to the source code, enabling a smooth development experience within the Kubernetes environment.

## Basic Concepts

### Facilities

Emergency facilities such as fire stations, police stations, or hospitals with emergency departments. Each facility has a location and belongs to a facility type.

### Vehicle Types

Standardized vehicle types with defined performance parameters (speeds in different environments). Each facility type has typical vehicle types.

### Vehicles

Specific vehicles at a location. A facility can have multiple vehicles of different types.

### Isochrones

Areas that are reachable within a certain time from a facility with a specific vehicle type.

## API Endpoints

### 1. Regions and Areas

#### 1.1 Retrieve Available Regions

```
GET /api/regions
```

Returns a list of available regions (Germany, federal states, major cities).

**Response:**

```json
{
  "regions": [
    {
      "id": "deutschland",
      "name": "Germany",
      "type": "country",
      "bounds": {
        "northeast": { "lat": 55.0815, "lng": 15.0418 },
        "southwest": { "lat": 47.2701, "lng": 5.8662 }
      }
    },
    {
      "id": "berlin",
      "name": "Berlin",
      "type": "city",
      "bounds": {
        "northeast": { "lat": 52.6754, "lng": 13.7611 },
        "southwest": { "lat": 52.3382, "lng": 13.0883 }
      }
    }
  ]
}
```

#### 1.2 Location Search

```
GET /api/regions/search?query=Berlin
```

Searches for locations that can be used to define map boundaries.

**Parameters:**

- `query`: Search term (city, postal code, etc.)

**Response:**

```json
{
  "results": [
    {
      "id": "berlin",
      "name": "Berlin",
      "type": "city",
      "location": { "lat": 52.52, "lng": 13.4049 }
    },
    {
      "id": "berlin-mitte",
      "name": "Berlin-Mitte",
      "type": "district",
      "location": { "lat": 52.5244, "lng": 13.4105 }
    }
  ]
}
```

### 2. Facility Types

#### 2.1 Retrieve Facility Types

```
GET /api/facility-types
```

Returns available facility types for emergency services.

**Response:**

```json
{
  "facility_types": [
    {
      "id": "feuerwehr",
      "name": "Fire Department",
      "description": "Fire stations and rescue centers",
      "icon_url": "/icons/feuerwehr.svg"
    },
    {
      "id": "polizei",
      "name": "Police",
      "description": "Police stations and precincts",
      "icon_url": "/icons/polizei.svg"
    },
    {
      "id": "krankenhaus",
      "name": "Hospital",
      "description": "Hospitals with emergency departments",
      "icon_url": "/icons/krankenhaus.svg"
    }
  ]
}
```

### 3. Facilities

#### 3.1 Retrieve Facilities by Region and Type

```
GET /api/facilities?region=berlin&types=feuerwehr,polizei
```

Returns facilities in a specific region, optionally filtered by types.

**Parameters:**

- `region`: ID of a region (optional, default: Germany)
- `types`: Comma-separated list of facility types (optional)

**Response:**

```json
{
  "facilities": [
    {
      "id": 1,
      "facility_type_id": "feuerwehr",
      "name": "Fire Station Kreuzberg",
      "address": "Wiener Straße 12, 10999 Berlin",
      "location": { "lat": 52.4951, "lng": 13.4314 },
      "contact": {
        "phone": "+49 30 12345678",
        "email": "kreuzberg@berliner-feuerwehr.de"
      }
    },
    {
      "id": 2,
      "facility_type_id": "polizei",
      "name": "Police Precinct 53",
      "address": "Friedrichstraße 219, 10969 Berlin",
      "location": { "lat": 52.5065, "lng": 13.3887 },
      "contact": {
        "phone": "+49 30 87654321"
      }
    }
  ],
  "total_count": 2,
  "region": {
    "id": "berlin",
    "name": "Berlin"
  }
}
```

#### 3.2 Retrieve Facilities by Map Area

```
GET /api/facilities/by-bounds?neLat=52.52&neLng=13.41&swLat=52.50&swLng=13.38&types=feuerwehr
```

Returns facilities within a map area.

**Parameters:**

- `neLat`, `neLng`: Northeast corner (Latitude, Longitude)
- `swLat`, `swLng`: Southwest corner (Latitude, Longitude)
- `types`: Comma-separated list of facility types (optional)

**Response:** _(identical to 3.1)_

#### 3.3 Retrieve Facility Details

```
GET /api/facilities/:id
```

Returns detailed information about a facility, including available vehicles.

**Response:**

```json
{
  "facility": {
    "id": 1,
    "facility_type_id": "feuerwehr",
    "facility_type_name": "Fire Department",
    "name": "Fire Station Kreuzberg",
    "address": "Wiener Straße 12, 10999 Berlin",
    "location": { "lat": 52.4951, "lng": 13.4314 },
    "contact": {
      "phone": "+49 30 12345678",
      "email": "kreuzberg@berliner-feuerwehr.de"
    },
    "vehicles": [
      {
        "id": 101,
        "vehicle_type_id": "loeschfahrzeug",
        "vehicle_type_name": "Fire Engine",
        "count": 2
      },
      {
        "id": 102,
        "vehicle_type_id": "drehleiterwagen",
        "vehicle_type_name": "Ladder Truck",
        "count": 1
      },
      {
        "id": 103,
        "vehicle_type_id": "rettungswagen",
        "vehicle_type_name": "Ambulance",
        "count": 3
      }
    ]
  }
}
```

### 4. Vehicle Types

#### 4.1 Retrieve Vehicle Types by Facility Type

```
GET /api/vehicle-types?facilityType=feuerwehr
```

Returns available vehicle types for a specific facility type.

**Parameters:**

- `facilityType`: ID of the facility type

**Response:**

```json
{
  "vehicle_types": [
    {
      "id": "loeschfahrzeug",
      "name": "Fire Engine",
      "description": "Standard fire department vehicle",
      "icon_url": "/icons/loeschfahrzeug.svg",
      "speed_profiles": {
        "highway": 90, // km/h on highways
        "rural": 70, // km/h on rural roads
        "urban": 50 // km/h in urban areas
      },
      "response_time": 2 // minutes until dispatch
    },
    {
      "id": "drehleiterwagen",
      "name": "Ladder Truck",
      "description": "Vehicle with ladder for height rescue",
      "icon_url": "/icons/drehleiterwagen.svg",
      "speed_profiles": {
        "highway": 80,
        "rural": 60,
        "urban": 40
      },
      "response_time": 3
    }
  ]
}
```

### 5. Isochrone Calculation

#### 5.1 Calculate Isochrones

```
POST /api/isochrones/calculate
```

Calculates accessibility areas (isochrones) for selected facilities and vehicle types.

**Request Body:**

```json
{
  "facilities": [
    {
      "id": 1,
      "vehicles": ["loeschfahrzeug", "rettungswagen"]
    },
    {
      "id": 2,
      "vehicles": ["loeschfahrzeug"]
    }
  ],
  "timeWindows": [5, 10, 15],
  "trafficConditions": {
    "considerTraffic": true,
    "timeOfDay": "current", // Alternatives: "morning_rush", "evening_rush", "off_peak"
    "dayType": "weekday" // Alternatives: "weekend"
  }
}
```

**Response:**

```json
{
  "isochrones": [
    {
      "facility_id": 1,
      "facility_name": "Fire Station Kreuzberg",
      "vehicle_type": "loeschfahrzeug",
      "vehicle_name": "Fire Engine",
      "time_window": 10,
      "traffic_conditions": {
        "considerTraffic": true,
        "timeOfDay": "current",
        "dayType": "weekday",
        "averageFactor": 0.85
      },
      "metadata": {
        "area_km2": 12.6,
        "max_distance_km": 6.8,
        "estimated_population": 145000
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [13.4314, 52.4951],
            [13.4614, 52.5051],
            // Additional coordinates...
            [13.4314, 52.4951]
          ]
        ]
      }
    }
    // Additional isochrones...
  ]
}
```

#### 5.2 Retrieve Traffic Factors

```
GET /api/traffic/factors?region=berlin
```

Returns current traffic factors for a region.

**Parameters:**

- `region`: ID of a region

**Response:**

```json
{
  "region": "berlin",
  "timestamp": "2025-02-26T14:30:00Z",
  "factors": {
    "urban": 0.75, // 25% slower in the city
    "rural": 0.9, // 10% slower on country roads
    "highway": 0.95 // 5% slower on highways
  },
  "special_conditions": [
    {
      "type": "congestion",
      "location": { "lat": 52.5065, "lng": 13.3887 },
      "description": "High traffic volume",
      "factor": 0.5, // 50% slower
      "radius_km": 2
    }
  ]
}
```

## Data Structures

### Region

```json
{
  "id": "string",
  "name": "string",
  "type": "string", // "country", "state", "city", "district"
  "bounds": {
    "northeast": { "lat": "number", "lng": "number" },
    "southwest": { "lat": "number", "lng": "number" }
  },
  "location": { "lat": "number", "lng": "number" } // Center
}
```

### Facility Type

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "icon_url": "string"
}
```

### Facility

```json
{
  "id": "number",
  "facility_type_id": "string",
  "facility_type_name": "string",
  "name": "string",
  "address": "string",
  "location": { "lat": "number", "lng": "number" },
  "contact": {
    "phone": "string",
    "email": "string",
    "website": "string"
  },
  "vehicles": [
    {
      "vehicle_type_id": "string",
      "vehicle_type_name": "string",
      "count": "number"
    }
  ]
}
```

### Vehicle Type

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "icon_url": "string",
  "speed_profiles": {
    "highway": "number", // km/h on highways
    "rural": "number", // km/h on rural roads
    "urban": "number" // km/h in urban areas
  },
  "response_time": "number" // minutes until dispatch
}
```

### Isochrone

```json
{
  "facility_id": "number",
  "facility_name": "string",
  "vehicle_type": "string",
  "vehicle_name": "string",
  "time_window": "number",
  "traffic_conditions": {
    "considerTraffic": "boolean",
    "timeOfDay": "string",
    "dayType": "string",
    "averageFactor": "number"
  },
  "metadata": {
    "area_km2": "number",
    "max_distance_km": "number",
    "estimated_population": "number"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": "array"
  }
}
```

## Examples

### Example 1: Accessibility Areas for Fire Stations in Berlin

1. Retrieve all fire stations in Berlin:

```REST
GET /api/facilities?region=berlin&types=feuerwehr
```

2. Calculate accessibility areas for fire engines and ambulances for two selected fire stations:

```
POST /api/isochrones/calculate
{
  "facilities": [
    {"id": 1, "vehicles": ["loeschfahrzeug", "rettungswagen"]},
    {"id": 3, "vehicles": ["loeschfahrzeug", "rettungswagen"]}
  ],
  "timeWindows": [5, 10, 15],
  "trafficConditions": {
    "considerTraffic": true,
    "timeOfDay": "current",
    "dayType": "weekday"
  }
}
```

### Example 2: Quick Single Query for a Facility

```
GET /api/isochrones/calculate?facilityId=1&vehicleType=loeschfahrzeug&timeWindows=5,10,15&considerTraffic=true
```

## Implementation Notes

### Google Maps API Integration

The API uses the following Google Maps services:

1. **Google Maps JavaScript API** for map display
2. **Distance Matrix API** for traffic data and travel time calculations
3. **Geocoding API** for location search and region delineation

For calculating isochrones, a network analysis algorithm is used that is based on the Distance Matrix API and includes the following steps:

1. Calculation of a grid of points around the origin location
2. Querying travel times from the facility to these points
3. Interpolation of the isochrone based on travel times
4. Smoothing of the resulting polygon

### Traffic Data

Traffic data is considered in three ways:

1. **Real-time traffic**: Current traffic situation via the Google Distance Matrix API
2. **Historical patterns**: Typical traffic patterns based on day and time
3. **Special situations**: Major events, construction sites, etc., that can be manually defined
