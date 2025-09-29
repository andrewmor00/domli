-- Update property types to include new options

-- Drop existing constraint on user_preferences
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_property_type_check;

-- Add new constraint with expanded property types
ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_property_type_check 
    CHECK (property_type IN ('apartment', 'house', 'penthouse', 'commercial', 'land'));

-- Update properties table constraint as well
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_property_type_check;

-- Add new constraint for properties table
ALTER TABLE properties ADD CONSTRAINT properties_property_type_check 
    CHECK (property_type IN ('apartment', 'house', 'penthouse', 'commercial', 'land'));

-- Add updated_at column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger for users updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 