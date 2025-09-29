-- Add reservations table for user property bookings

-- Property reservations table
CREATE TABLE IF NOT EXISTS property_reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    reservation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate active reservations for the same property by the same user
    UNIQUE(user_id, property_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_reservations_user_id ON property_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_property_reservations_property_id ON property_reservations(property_id);
CREATE INDEX IF NOT EXISTS idx_property_reservations_status ON property_reservations(status);
CREATE INDEX IF NOT EXISTS idx_property_reservations_expires_at ON property_reservations(expires_at);

-- Create trigger for updated_at
CREATE TRIGGER update_property_reservations_updated_at 
    BEFORE UPDATE ON property_reservations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired reservations
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS void AS $$
BEGIN
    UPDATE property_reservations 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql; 