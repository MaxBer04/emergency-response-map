-- Berlin
INSERT INTO facilities (facility_type_id, name, address, location, phone, email)
VALUES 
(
 (SELECT id FROM facility_types WHERE code = 'feuerwehr'),
 'Feuerwache Kreuzberg',
 'Wiener Straße 12, 10999 Berlin',
 ST_GeographyFromText('POINT(13.4314 52.4951)'),
 '+49 30 12345678',
 'kreuzberg@berliner-feuerwehr.de'
),
(
 (SELECT id FROM facility_types WHERE code = 'feuerwehr'),
 'Feuerwache Mitte',
 'Linienstraße 128, 10115 Berlin',
 ST_GeographyFromText('POINT(13.4082 52.5294)'),
 '+49 30 23456789',
 'mitte@berliner-feuerwehr.de'
),
(
 (SELECT id FROM facility_types WHERE code = 'polizei'),
 'Polizeiabschnitt 53',
 'Friedrichstraße 219, 10969 Berlin',
 ST_GeographyFromText('POINT(13.3887 52.5065)'),
 '+49 30 87654321',
 NULL
),
(
 (SELECT id FROM facility_types WHERE code = 'polizei'),
 'Polizeiabschnitt 36',
 'Pankstraße 29, 13357 Berlin',
 ST_GeographyFromText('POINT(13.3841 52.5487)'),
 '+49 30 76543210',
 NULL
),
(
 (SELECT id FROM facility_types WHERE code = 'krankenhaus'),
 'Charité - Campus Mitte',
 'Charitéplatz 1, 10117 Berlin',
 ST_GeographyFromText('POINT(13.3777 52.5229)'),
 '+49 30 45050',
 'info@charite.de'
);

-- München
INSERT INTO facilities (facility_type_id, name, address, location, phone, email)
VALUES 
(
 (SELECT id FROM facility_types WHERE code = 'feuerwehr'),
 'Feuerwache 1 - Hauptfeuerwache',
 'An der Hauptfeuerwache 8, 80331 München',
 ST_GeographyFromText('POINT(11.5571 48.1396)'),
 '+49 89 12345678',
 'hauptfeuerwache@muenchen.de'
),
(
 (SELECT id FROM facility_types WHERE code = 'polizei'),
 'Polizeipräsidium München',
 'Ettstraße 2, 80333 München',
 ST_GeographyFromText('POINT(11.5661 48.1393)'),
 '+49 89 29100',
 'poststelle@polizei-muenchen.de'
);

-- Hamburg
INSERT INTO facilities (facility_type_id, name, address, location, phone, email)
VALUES 
(
 (SELECT id FROM facility_types WHERE code = 'feuerwehr'),
 'Feuer- und Rettungswache Innenstadt',
 'Admiralitätstraße 54, 20459 Hamburg',
 ST_GeographyFromText('POINT(9.9812 53.5464)'),
 '+49 40 42851-0',
 NULL
),
(
 (SELECT id FROM facility_types WHERE code = 'polizei'),
 'Polizeikommissariat 11 - St. Georg',
 'Steindamm 82, 20099 Hamburg',
 ST_GeographyFromText('POINT(10.0087 53.5538)'),
 '+49 40 4286-51110',
 NULL
);