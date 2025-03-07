-- Tabelle: vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id),
    vehicle_type_id UUID NOT NULL REFERENCES vehicle_types(id),
    count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(facility_id, vehicle_type_id)
);

CREATE INDEX vehicles_facility_idx ON vehicles(facility_id);
CREATE INDEX vehicles_vehicle_type_idx ON vehicles(vehicle_type_id);

-- Trigger für updated_at
CREATE TRIGGER update_vehicles_modtime
BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();