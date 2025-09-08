-- Railway QR Tracker Sample Data
-- Smart India Hackathon 2025
-- Additional sample data for testing and demonstration

USE railway_qr_tracker;

-- Additional sample components for comprehensive testing
INSERT INTO components (component_id, qr_code, component_type, manufacturer, batch_number, manufacturing_date, track_section, km_post, status) VALUES
('ERC-TEST-009', 'QR_ERC_TEST_009_VIZAG_2025', 'ERC', 'Vizag Steel', 'TEST_BATCH_009', '2025-05-01', 'VZG-045', 890.123, 'Active'),
('RPD-TEST-010', 'QR_RPD_TEST_010_BOKARO_2025', 'RPD', 'Bokaro Steel Plant', 'TEST_BATCH_010', '2025-05-05', 'BOK-078', 123.789, 'Active'),
('LNR-TEST-011', 'QR_LNR_TEST_011_ROURKELA_2025', 'LNR', 'Rourkela Steel Plant', 'TEST_BATCH_011', '2025-05-10', 'ROU-156', 456.012, 'Active'),
('ERC-TEST-012', 'QR_ERC_TEST_012_BURNPUR_2025', 'ERC', 'Burnpur Cement', 'TEST_BATCH_012', '2025-05-15', 'BRN-234', 678.345, 'Inactive'),
('RPD-TEST-013', 'QR_RPD_TEST_013_JAMSHEDPUR_2025', 'RPD', 'Jamshedpur Steel', 'TEST_BATCH_013', '2025-05-20', 'JAM-567', 890.678, 'Active');

-- Additional scan history for analytics
INSERT INTO scan_history (id, component_id, qr_code, scanned_by, scan_location, scan_timestamp, latitude, longitude, scan_type) VALUES
(UUID(), 'ERC-TEST-009', 'QR_ERC_TEST_009_VIZAG_2025', 'engineer1', 'Visakhapatnam Junction', DATE_SUB(NOW(), INTERVAL 1 DAY), 17.6868, 83.2185, 'Manual'),
(UUID(), 'RPD-TEST-010', 'QR_RPD_TEST_010_BOKARO_2025', 'supervisor1', 'Bokaro Steel City', DATE_SUB(NOW(), INTERVAL 2 DAY), 23.6693, 86.1511, 'Inspection'),
(UUID(), 'LNR-TEST-011', 'QR_LNR_TEST_011_ROURKELA_2025', 'inspector1', 'Rourkela Junction', DATE_SUB(NOW(), INTERVAL 3 DAY), 22.2604, 84.8536, 'Maintenance');

-- Additional quality reports for testing workflows
INSERT INTO quality_reports (report_id, component_id, report_type, severity, description, reported_by, priority, estimated_cost) VALUES
(UUID(), 'ERC-TEST-009', 'Corrosion', 'Medium', 'Surface corrosion detected on rail clip', 'inspector1', 3, 2000.00),
(UUID(), 'RPD-TEST-010', 'Wear', 'High', 'Excessive wear on rail pad surface', 'engineer1', 2, 3500.00),
(UUID(), 'LNR-TEST-011', 'Quality', 'Low', 'Minor manufacturing defect noted', 'supervisor1', 4, 500.00);

SELECT 'Sample data loaded successfully for testing' as status;
