-- Tabelle: facilities
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_type_id UUID NOT NULL REFERENCES facility_types(id),
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index für räumliche Abfragen auf facilities
CREATE INDEX facilities_location_idx ON facilities USING GIST(location);
CREATE INDEX facilities_facility_type_idx ON facilities(facility_type_id);

-- Trigger für updated_at
CREATE TRIGGER update_facilities_modtime
BEFORE UPDATE ON facilities
FOR EACH ROW EXECUTE FUNCTION update_modified_column();