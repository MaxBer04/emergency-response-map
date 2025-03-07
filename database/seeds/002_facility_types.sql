-- Einrichtungstypen
INSERT INTO facility_types (code, name, description, icon_url)
VALUES 
('feuerwehr', 'Feuerwehr', 'Feuerwehrstationen und Rettungswachen', '/icons/feuerwehr.svg'),
('polizei', 'Polizei', 'Polizeistationen und -reviere', '/icons/polizei.svg'),
('krankenhaus', 'Krankenhaus', 'Krankenhäuser mit Notaufnahme', '/icons/krankenhaus.svg')
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_url = EXCLUDED.icon_url;