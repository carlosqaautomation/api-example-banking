-- =====================================================
-- BankAPI Database Schema for Supabase
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_number VARCHAR(20) UNIQUE NOT NULL,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('savings', 'checking')),
  balance DECIMAL(15, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Beneficiaries table
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  bank_name VARCHAR(100),
  relationship VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transfers table
CREATE TABLE IF NOT EXISTS transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_account_id UUID NOT NULL REFERENCES accounts(id),
  to_account_id UUID NOT NULL REFERENCES accounts(id),
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  description VARCHAR(255),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  transfer_type VARCHAR(20) DEFAULT 'internal' CHECK (transfer_type IN ('internal', 'external')),
  reference VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id),
  amount DECIMAL(15, 2) NOT NULL,
  deposit_type VARCHAR(20) DEFAULT 'bank_transfer',
  reference VARCHAR(100),
  confirmation_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id),
  service_id VARCHAR(50) NOT NULL,
  service_name VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  processing_fee DECIMAL(10, 2) DEFAULT 0.00,
  total_amount DECIMAL(15, 2) NOT NULL,
  reference VARCHAR(100),
  confirmation_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Virtual cards table
CREATE TABLE IF NOT EXISTS virtual_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id),
  card_number VARCHAR(16) UNIQUE NOT NULL,
  card_type VARCHAR(20) DEFAULT 'virtual',
  cvv VARCHAR(3) NOT NULL,
  expiry_date VARCHAR(5) NOT NULL,
  card_holder_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  daily_limit DECIMAL(15, 2) DEFAULT 1000.00,
  daily_spent DECIMAL(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Card transactions table
CREATE TABLE IF NOT EXISTS card_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES virtual_cards(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description VARCHAR(255),
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_from_account ON transfers(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_account ON transfers(to_account_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id ON beneficiaries(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_virtual_cards_user_id ON virtual_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_card_id ON card_transactions(card_id);

-- =====================================================
-- Seed Data - Test Users and Accounts
-- =====================================================

-- Test user 1 (password: password123)
INSERT INTO users (id, email, password_hash, full_name, phone)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'test@bankapi.com',
  '$2a$10$xGJ9QK1p7L8K3wF5hR2XzO9YvL1kJ2mN3oP4qR5sT6uV7wX8y9z0',
  'Test User',
  '+1234567890'
)
ON CONFLICT (email) DO NOTHING;

-- Test user 2 (password: password123)
INSERT INTO users (id, email, password_hash, full_name, phone)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  'admin@bankapi.com',
  '$2a$10$xGJ9QK1p7L8K3wF5hR2XzO9YvL1kJ2mN3oP4qR5sT6uV7wX8y9z0',
  'Admin User',
  '+1234567891'
)
ON CONFLICT (email) DO NOTHING;

-- Account 1 - Savings (User 1)
INSERT INTO accounts (id, user_id, account_number, account_type, balance, currency)
VALUES (
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '1234567890',
  'savings',
  5000.00,
  'USD'
)
ON CONFLICT (account_number) DO NOTHING;

-- Account 2 - Checking (User 1)
INSERT INTO accounts (id, user_id, account_number, account_type, balance, currency)
VALUES (
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '1234567891',
  'checking',
  2500.00,
  'USD'
)
ON CONFLICT (account_number) DO NOTHING;

-- Account 3 - Savings (User 2)
INSERT INTO accounts (id, user_id, account_number, account_type, balance, currency)
VALUES (
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  '9876543210',
  'savings',
  10000.00,
  'USD'
)
ON CONFLICT (account_number) DO NOTHING;

-- Beneficiaries
INSERT INTO beneficiaries (id, user_id, name, account_number, bank_name, relationship)
VALUES
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'John Doe',
    '5551234567',
    'Bank of America',
    'friend'
  ),
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Jane Smith',
    '5559876543',
    'Wells Fargo',
    'family'
  )
ON CONFLICT DO NOTHING;

-- Sample transfers
INSERT INTO transfers (id, from_account_id, to_account_id, amount, description, status, transfer_type, reference, completed_at)
VALUES
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    500.00,
    'Payment for services',
    'completed',
    'internal',
    'TRF001',
    CURRENT_TIMESTAMP
  ),
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    250.00,
    'Monthly rent',
    'completed',
    'internal',
    'TRF002',
    CURRENT_TIMESTAMP
  )
ON CONFLICT DO NOTHING;

-- Sample deposits
INSERT INTO deposits (id, user_id, account_id, amount, deposit_type, reference, confirmation_number, status, created_at)
VALUES
  (
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    1000.00,
    'bank_transfer',
    'Salary deposit',
    'DEP1234567890',
    'completed',
    CURRENT_TIMESTAMP
  ),
  (
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    500.00,
    'cash',
    'Cash deposit',
    'DEP1234567891',
    'completed',
    CURRENT_TIMESTAMP
  )
ON CONFLICT DO NOTHING;

-- Sample payments
INSERT INTO payments (id, user_id, account_id, service_id, service_name, amount, processing_fee, total_amount, reference, confirmation_number, status, created_at)
VALUES
  (
    'g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'electricity',
    'Electricidad',
    150.00,
    1.50,
    151.50,
    'Bill #12345',
    'PAY1234567890',
    'completed',
    CURRENT_TIMESTAMP
  ),
  (
    'g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'internet',
    'Internet',
    80.00,
    2.00,
    82.00,
    'Monthly plan',
    'PAY1234567891',
    'completed',
    CURRENT_TIMESTAMP
  )
ON CONFLICT DO NOTHING;

-- Sample virtual cards
INSERT INTO virtual_cards (id, user_id, account_id, card_number, card_type, cvv, expiry_date, card_holder_name, is_active, daily_limit, daily_spent, created_at)
VALUES
  (
    'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '4532015112830366',
    'virtual',
    '123',
    '12/28',
    'Test User',
    true,
    1000.00,
    250.00,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (card_number) DO NOTHING;

-- Note: The password hash '$2a$10$xGJ9QK1p7L8K3wF5hR2XzO9YvL1kJ2mN3oP4qR5sT6uV7wX8y9z0' is 'password123'