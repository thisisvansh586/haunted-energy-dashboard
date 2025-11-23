-- Cleanup and Setup Script for Haunted Energy Dashboard
-- Run this FIRST to clean up any existing tables and start fresh

-- ============================================================================
-- DROP EXISTING TABLES (if they exist)
-- ============================================================================

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS anomalies CASCADE;
DROP TABLE IF EXISTS telemetry CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS homes CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- NOW RUN THE MAIN SCHEMA (001_schema.sql)
-- ============================================================================

-- After running this cleanup, run the 001_schema.sql file
