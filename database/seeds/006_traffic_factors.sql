-- Verkehrsfaktoren für Deutschland
INSERT INTO traffic_factors (region_id, day_type, time_of_day, urban_factor, rural_factor, highway_factor, valid_from, valid_to)
VALUES 
(
 (SELECT id FROM regions WHERE code = 'de'),
 'weekday',
 'morning_rush',
 0.65, 0.85, 0.75,
 '2025-01-01 00:00:00+00',
 '2025-12-31 23:59:59+00'
),
(
 (SELECT id FROM regions WHERE code = 'de'),
 'weekday',
 'evening_rush',
 0.60, 0.80, 0.70,
 '2025-01-01 00:00:00+00',
 '2025-12-31 23:59:59+00'
),
(
 (SELECT id FROM regions WHERE code = 'de'),
 'weekday',
 'off_peak',
 0.85, 0.95, 0.95,
 '2025-01-01 00:00:00+00',
 '2025-12-31 23:59:59+00'
),
(
 (SELECT id FROM regions WHERE code = 'de'),
 'weekend',
 'off_peak',
 0.90, 0.95, 0.90,
 '2025-01-01 00:00:00+00',
 '2025-12-31 23:59:59+00'
);

-- Verkehrsfaktoren für Berlin
INSERT INTO traffic_factors (region_id, day_type, time_of_day, urban_factor, rural_factor, highway_factor, valid_from, valid_to)
VALUES 
(
 (SELECT id FROM regions WHERE code = 'berlin'),
 'weekday',
 'morning_rush',
 0.60, 0.80, 0.70,
 '2025-01-01 00:00:00+00',
 '2025-12-31 23:59:59+00'
),
(
 (SELECT id FROM regions WHERE code = 'berlin'),
 'weekday',
 'evening_rush',
 0.55, 0.75, 0.65,
 '2025-01-01 00:00:00+00',
 '2025-12-31 23:59:59+00'
),
(
 (SELECT id FROM regions WHERE code = 'berlin'),
 'weekday',
 'off_peak',
 0.80, 0.90, 0.90,
 '2025-01-01 00:00:00+00',
 '2025-12-31 23:59:59+00'
),
(
 (SELECT id FROM regions WHERE code = 'berlin'),
 'weekend',
 'off_peak',
 0.85, 0.95, 0.90,
 '2025-01-01 00:00:00+00',
 '2025-12-31 23:59:59+00'
);

-- Verkehrsfaktoren für München
INSERT INTO traffic_factors (region_id, day_type, time_of_day, urban_factor, rural_factor, highway_factor, valid_from, valid_to)
VALUES 
(
 (SELECT id FROM regions WHERE code = 'muenchen'),
 'weekday',
 'morning_rush',
 0.55, 0.75, 0.65,
 '2025-01-01 00:00:00+00',
 '2025-12-31 23:59:59+00'
),
(
 (SELECT id FROM regions WHERE code = 'muenchen'),
 'weekday',
 'evening_rush',
 0.50, 0.70, 0.60,
 '2025-01-01 00:00:00+00',
 '2025-12-31 23:59:59+00'
);

-- Verkehrsfaktoren für Hamburg
INSERT INTO traffic_factors (region_id, day_type, time_of_day, urban_factor, rural_factor, highway_factor, valid_from, valid_to)
VALUES 
(
 (SELECT id FROM regions WHERE code = 'hamburg'),
 'weekday',
 'morning_rush',
 0.60, 0.80, 0.70,
 '2025-01-01 00:00:00+00',
 '2025-12-31 23:59:59+00'
),
(
 (SELECT id FROM regions WHERE code = 'hamburg'),
 'weekday',
 'evening_rush',
 0.55, 0.75, 0.65,
 '2025-01-01 00:00:00+00',
 '2025-12-31 23:59:59+00'
);