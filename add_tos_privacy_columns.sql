-- Add TOS and privacy agreement columns to users table
ALTER TABLE users ADD COLUMN tos_agreed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN privacy_agreed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN tos_agreed_at TIMESTAMP;
ALTER TABLE users ADD COLUMN privacy_agreed_at TIMESTAMP;