CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    tax_id VARCHAR(50) UNIQUE NOT NULL,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    trr VARCHAR(34) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    owner_id UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_business_name ON businesses(name);
CREATE INDEX IF NOT EXISTS idx_business_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_bussiness_email ON businesses(email);
