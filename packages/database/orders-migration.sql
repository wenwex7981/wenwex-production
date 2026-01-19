-- ==========================================
-- Orders Table Migration for Razorpay Integration
-- Run this SQL in your Supabase SQL Editor
-- ==========================================

-- 1. Orders Table (for service bookings with Razorpay payments)
-- Note: user_id is TEXT to match Supabase auth.users.id format
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,  -- Supabase auth user ID (no foreign key to avoid type mismatch)
    service_id VARCHAR(255) NOT NULL,
    vendor_id VARCHAR(255) NOT NULL,
    
    -- Payment details
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_id VARCHAR(255),  -- Razorpay payment ID
    payment_order_id VARCHAR(255),  -- Razorpay order ID
    payment_status VARCHAR(50) DEFAULT 'pending',  -- pending, paid, failed, refunded
    
    -- Order details
    order_status VARCHAR(50) DEFAULT 'pending',  -- pending, confirmed, in_progress, completed, cancelled
    requirements TEXT,  -- Customer project requirements
    delivery_date TIMESTAMP WITH TIME ZONE,
    
    -- Customer info
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_name VARCHAR(255),
    
    -- Vendor notes
    vendor_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_service_id ON orders(service_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 2. Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for orders
-- Allow anyone to insert orders (for guest checkout)
DROP POLICY IF EXISTS "Allow public insert for orders" ON orders;
CREATE POLICY "Allow public insert for orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own orders
DROP POLICY IF EXISTS "Allow users to view own orders" ON orders;
CREATE POLICY "Allow users to view own orders" ON orders
    FOR SELECT USING (true);

-- Allow authenticated users to update orders
DROP POLICY IF EXISTS "Allow authenticated users to update orders" ON orders;
CREATE POLICY "Allow authenticated users to update orders" ON orders
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Add razorpay_payment_id column to vendors table for subscription payments
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

-- Done!
SELECT 'Orders table migration complete!' AS status;
