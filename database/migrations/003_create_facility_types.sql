-- Tabelle: facility_types
CREATE TABLE facility_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger für updated_at
CREATE TRIGGER update_facility_types_modtime
BEFORE UPDATE ON facility_types
FOR EACH ROW EXECUTE FUNCTION update_modified_column();