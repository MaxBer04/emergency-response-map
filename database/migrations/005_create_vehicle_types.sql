-- Tabelle: vehicle_types
CREATE TABLE vehicle_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    facility_type_id UUID NOT NULL REFERENCES facility_types(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    highway_speed FLOAT NOT NULL,
    rural_speed FLOAT NOT NULL,
    urban_speed FLOAT NOT NULL,
    response_time INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX vehicle_types_facility_type_idx ON vehicle_types(facility_type_id);

-- Trigger für updated_at
CREATE TRIGGER update_vehicle_types_modtime
BEFORE UPDATE ON vehicle_types
FOR EACH ROW EXECUTE FUNCTION update_modified_column();