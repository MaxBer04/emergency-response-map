-- Enumeration für Regionentypen
CREATE TYPE region_type AS ENUM ('country', 'state', 'city', 'district');

-- Tabelle: regions
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type region_type NOT NULL,
    center GEOGRAPHY(POINT) NOT NULL,
    bounds GEOGRAPHY(POLYGON) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index für räumliche Abfragen auf regions
CREATE INDEX regions_bounds_idx ON regions USING GIST(bounds);
CREATE INDEX regions_center_idx ON regions USING GIST(center);

-- Trigger für updated_at
CREATE TRIGGER update_regions_modtime
BEFORE UPDATE ON regions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();