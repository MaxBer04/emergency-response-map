-- Tabelle: isochrones (für Caching berechneter Isochronen)
CREATE TABLE isochrones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id),
    vehicle_type_id UUID NOT NULL REFERENCES vehicle_types(id),
    time_window INTEGER NOT NULL, -- in Minuten
    consider_traffic BOOLEAN NOT NULL DEFAULT TRUE,
    time_of_day VARCHAR(20), -- 'current', 'morning_rush', 'evening_rush', 'off_peak'
    day_type VARCHAR(20),    -- 'weekday', 'weekend'
    geometry GEOGRAPHY(POLYGON) NOT NULL,
    area_km2 FLOAT,
    max_distance_km FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(facility_id, vehicle_type_id, time_window, consider_traffic, time_of_day, day_type)
);

CREATE INDEX isochrones_facility_idx ON isochrones(facility_id);
CREATE INDEX isochrones_vehicle_type_idx ON isochrones(vehicle_type_id);
CREATE INDEX isochrones_geometry_idx ON isochrones USING GIST(geometry);
CREATE INDEX isochrones_expires_idx ON isochrones(expires_at);