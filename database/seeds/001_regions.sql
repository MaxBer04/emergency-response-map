-- Regionen
INSERT INTO regions (code, name, type, center, bounds)
VALUES 
('de', 'Deutschland', 'country', 
 ST_GeographyFromText('POINT(10.451526 51.165691)'),
 ST_GeographyFromText('POLYGON((5.8662 47.2701, 15.0418 47.2701, 15.0418 55.0815, 5.8662 55.0815, 5.8662 47.2701))')
),
('berlin', 'Berlin', 'city', 
 ST_GeographyFromText('POINT(13.404954 52.520007)'),
 ST_GeographyFromText('POLYGON((13.0883 52.3382, 13.7611 52.3382, 13.7611 52.6754, 13.0883 52.6754, 13.0883 52.3382))')
),
('muenchen', 'München', 'city', 
 ST_GeographyFromText('POINT(11.5820 48.1351)'),
 ST_GeographyFromText('POLYGON((11.3603 48.0103, 11.7229 48.0103, 11.7229 48.2480, 11.3603 48.2480, 11.3603 48.0103))')
),
('hamburg', 'Hamburg', 'city', 
 ST_GeographyFromText('POINT(9.9937 53.5511)'),
 ST_GeographyFromText('POLYGON((9.7312 53.3951, 10.2498 53.3951, 10.2498 53.6936, 9.7312 53.6936, 9.7312 53.3951))')
)
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name,
    type = EXCLUDED.type,
    center = EXCLUDED.center,
    bounds = EXCLUDED.bounds;