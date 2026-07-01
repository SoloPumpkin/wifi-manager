-- Create profiles table for IP tracking
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for IP lookup during signup
CREATE INDEX IF NOT EXISTS idx_profiles_ip_address ON profiles (ip_address);

-- Unique constraint: one IP = one account
ALTER TABLE profiles ADD CONSTRAINT unique_ip_address UNIQUE (ip_address);

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow trigger function to insert profile on user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, ip_address)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'ip_address'
  );
  RETURN NEW;
END;
$$;

-- Trigger after insert on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
