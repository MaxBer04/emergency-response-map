-- Tabelle: traffic_factors
CREATE TABLE traffic_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID NOT NULL REFERENCES regions(id),
    day_type VARCHAR(20) NOT NULL,
    time_of_day VARCHAR(20) NOT NULL,
    urban_factor FLOAT NOT NULL,
    rural_factor FLOAT NOT NULL,
    highway_factor FLOAT NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX traffic_factors_region_idx ON traffic_factors(region_id);
CREATE INDEX traffic_factors_validity_idx ON traffic_factors(valid_from, valid_to);

-- Trigger für updated_at
CREATE TRIGGER update_traffic_factors_modtime
BEFORE UPDATE ON traffic_factors
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Tabelle: special_traffic_conditions
CREATE TABLE special_traffic_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID NOT NULL REFERENCES regions(id),
    type VARCHAR(50) NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT) NOT NULL,
    radius_km FLOAT NOT NULL,
    factor FLOAT NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX special_traffic_conditions_region_idx ON special_traffic_conditions(region_id);
CREATE INDEX special_traffic_conditions_location_idx ON special_traffic_conditions USING GIST(location);
CREATE INDEX special_traffic_conditions_validity_idx ON special_traffic_conditions(valid_from, valid_to);

-- Trigger für updated_at
CREATE TRIGGER update_special_traffic_conditions_modtime
BEFORE UPDATE ON special_traffic_conditions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();