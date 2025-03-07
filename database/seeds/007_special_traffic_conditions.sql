-- Spezielle Verkehrsbedingungen (z.B. Großbaustellen, Veranstaltungen)
INSERT INTO special_traffic_conditions (region_id, type, description, location, radius_km, factor, valid_from, valid_to)
VALUES 
(
 (SELECT id FROM regions WHERE code = 'berlin'),
 'construction',
 'Großbaustelle Alexanderplatz',
 ST_GeographyFromText('POINT(13.4133 52.5219)'),
 1.5,
 0.5,
 '2025-01-01 00:00:00+00',
 '2025-06-30 23:59:59+00'
),
(
 (SELECT id FROM regions WHERE code = 'berlin'),
 'event',
 'Fußballspiel im Olympiastadion',
 ST_GeographyFromText('POINT(13.2395 52.5146)'),
 2.0,
 0.6,
 '2025-03-15 16:00:00+00',
 '2025-03-15 22:00:00+00'
),
(
 (SELECT id FROM regions WHERE code = 'muenchen'),
 'construction',
 'Tunnelbaustelle Mittlerer Ring',
 ST_GeographyFromText('POINT(11.5698 48.1559)'),
 1.0,
 0.7,
 '2025-02-01 00:00:00+00',
 '2025-10-31 23:59:59+00'
),
(
 (SELECT id FROM regions WHERE code = 'hamburg'),
 'event',
 'Hafengeburtstag',
 ST_GeographyFromText('POINT(9.9672 53.5435)'),
 2.5,
 0.4,
 '2025-05-08 00:00:00+00',
 '2025-05-10 23:59:59+00'
);