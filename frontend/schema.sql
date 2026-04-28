CREATE SCHEMA IF NOT EXISTS onboarding;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS onboarding.email_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    source TEXT DEFAULT 'website',
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_leads_email
ON onboarding.email_leads(email);

CREATE OR REPLACE FUNCTION onboarding.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_timestamp ON onboarding.email_leads;

CREATE TRIGGER trg_update_timestamp
BEFORE UPDATE ON onboarding.email_leads
FOR EACH ROW
EXECUTE FUNCTION onboarding.update_timestamp();
