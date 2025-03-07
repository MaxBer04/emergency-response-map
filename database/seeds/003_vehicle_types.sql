-- Fahrzeugtypen
INSERT INTO vehicle_types (code, facility_type_id, name, description, icon_url, highway_speed, rural_speed, urban_speed, response_time)
VALUES 
(
 'loeschfahrzeug', 
 (SELECT id FROM facility_types WHERE code = 'feuerwehr'), 
 'Löschfahrzeug', 
 'Standardfahrzeug der Feuerwehr', 
 '/icons/loeschfahrzeug.svg',
 90, 70, 50, 2
),
(
 'drehleiterwagen', 
 (SELECT id FROM facility_types WHERE code = 'feuerwehr'), 
 'Drehleiter', 
 'Fahrzeug mit Drehleiter für Höhenrettung', 
 '/icons/drehleiterwagen.svg',
 80, 60, 40, 3
),
(
 'rettungswagen', 
 (SELECT id FROM facility_types WHERE code = 'feuerwehr'), 
 'Rettungswagen', 
 'Fahrzeug für medizinische Notfälle', 
 '/icons/rettungswagen.svg',
 100, 80, 60, 1
),
(
 'streifenwagen', 
 (SELECT id FROM facility_types WHERE code = 'polizei'), 
 'Streifenwagen', 
 'Standardfahrzeug der Polizei', 
 '/icons/streifenwagen.svg',
 120, 100, 60, 1
),
(
 'mannschaftswagen', 
 (SELECT id FROM facility_types WHERE code = 'polizei'), 
 'Mannschaftswagen', 
 'Fahrzeug für Gruppenanforderungen', 
 '/icons/mannschaftswagen.svg',
 90, 70, 50, 5
),
(
 'notarztwagen', 
 (SELECT id FROM facility_types WHERE code = 'krankenhaus'), 
 'Notarztwagen', 
 'Fahrzeug für Notärzte', 
 '/icons/notarztwagen.svg',
 110, 90, 60, 1
)
ON CONFLICT (code) DO UPDATE 
SET facility_type_id = EXCLUDED.facility_type_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_url = EXCLUDED.icon_url,
    highway_speed = EXCLUDED.highway_speed,
    rural_speed = EXCLUDED.rural_speed,
    urban_speed = EXCLUDED.urban_speed,
    response_time = EXCLUDED.response_time;