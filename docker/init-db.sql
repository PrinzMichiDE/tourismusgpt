-- LDB-DataGuard Database Initialization Script
-- This script runs on first container start

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'Europe/Berlin';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ldb_dataguard TO ldb;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'LDB-DataGuard database initialized at %', NOW();
END $$;
