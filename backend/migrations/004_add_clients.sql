CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    company_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    tax_id VARCHAR(20) NOT NULL,
    registration_number VARCHAR(20) NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_business_id ON clients(business_id);
CREATE INDEX idx_clients_business_archived ON clients(business_id, is_archived);

CREATE UNIQUE INDEX idx_clients_business_email_unique
    ON clients(business_id, LOWER(email));