-- Vehicles seed file with single insert
INSERT INTO vehicles (facility_id, vehicle_type_id, count)
VALUES 
    -- Berlin Vehicles
    ((SELECT id FROM facilities WHERE name = 'Feuerwache Kreuzberg' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'loeschfahrzeug' LIMIT 1), 2),
    ((SELECT id FROM facilities WHERE name = 'Feuerwache Kreuzberg' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'drehleiterwagen' LIMIT 1), 1),
    ((SELECT id FROM facilities WHERE name = 'Feuerwache Kreuzberg' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'rettungswagen' LIMIT 1), 3),
    
    ((SELECT id FROM facilities WHERE name = 'Feuerwache Mitte' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'loeschfahrzeug' LIMIT 1), 3),
    ((SELECT id FROM facilities WHERE name = 'Feuerwache Mitte' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'drehleiterwagen' LIMIT 1), 1),
    ((SELECT id FROM facilities WHERE name = 'Feuerwache Mitte' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'rettungswagen' LIMIT 1), 4),
    
    ((SELECT id FROM facilities WHERE name = 'Polizeiabschnitt 53' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'streifenwagen' LIMIT 1), 4),
    ((SELECT id FROM facilities WHERE name = 'Polizeiabschnitt 53' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'mannschaftswagen' LIMIT 1), 1),
    
    ((SELECT id FROM facilities WHERE name = 'Polizeiabschnitt 36' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'streifenwagen' LIMIT 1), 3),
    
    ((SELECT id FROM facilities WHERE name = 'Charité - Campus Mitte' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'notarztwagen' LIMIT 1), 2),
    
    -- München Vehicles
    ((SELECT id FROM facilities WHERE name = 'Feuerwache 1 - Hauptfeuerwache' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'loeschfahrzeug' LIMIT 1), 4),
    ((SELECT id FROM facilities WHERE name = 'Feuerwache 1 - Hauptfeuerwache' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'drehleiterwagen' LIMIT 1), 2),
    
    ((SELECT id FROM facilities WHERE name = 'Polizeipräsidium München' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'streifenwagen' LIMIT 1), 6),
    
    -- Hamburg Vehicles
    ((SELECT id FROM facilities WHERE name = 'Feuer- und Rettungswache Innenstadt' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'loeschfahrzeug' LIMIT 1), 3),
    ((SELECT id FROM facilities WHERE name = 'Feuer- und Rettungswache Innenstadt' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'rettungswagen' LIMIT 1), 4),
    
    ((SELECT id FROM facilities WHERE name = 'Polizeikommissariat 11 - St. Georg' LIMIT 1), 
     (SELECT id FROM vehicle_types WHERE code = 'streifenwagen' LIMIT 1), 5)
ON CONFLICT (facility_id, vehicle_type_id) DO UPDATE 
SET count = EXCLUDED.count;