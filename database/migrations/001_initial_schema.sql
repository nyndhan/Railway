-- Railway QR Tracker Database Migration 001
-- Initial Schema Creation
-- Smart India Hackathon 2025

-- Migration metadata
INSERT INTO schema_migrations (version, description, applied_at) 
VALUES ('001', 'Initial Railway QR Tracker Schema', NOW())
ON DUPLICATE KEY UPDATE applied_at = NOW();

-- This file contains the core table creation
-- Actual implementation is in schema.sql
-- Use this for version-controlled migrations in production

SELECT 'Migration 001: Initial schema ready for application' as status;
