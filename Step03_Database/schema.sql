-- Create the applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    input_data JSONB NOT NULL,
    score FLOAT NOT NULL,
    approved BOOLEAN NOT NULL,
    risk_level TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous users to insert and select
CREATE POLICY "Allow anonymous insert and select" ON applications
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- Create index on created_at for fast history queries
CREATE INDEX idx_applications_created_at ON applications (created_at DESC);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();