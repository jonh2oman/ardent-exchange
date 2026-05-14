-- Create Profiles table (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'cadet' CHECK (role IN ('officer', 'cadet')),
  unit_name TEXT DEFAULT 'Ardent Cadet Corps',
  currency_name TEXT DEFAULT 'Ardent Dollars',
  balance DECIMAL(12, 2) DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Canteen', 'Swag')),
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cadet_id UUID REFERENCES profiles(id),
  officer_id UUID REFERENCES profiles(id),
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT CHECK (type IN ('purchase', 'reward', 'manual_adjustment')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Officers can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'officer')
);
CREATE POLICY "Officers can update balances" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'officer')
);

-- Products Policies
CREATE POLICY "Everyone can view products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Officers can manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'officer')
);

-- Transactions Policies
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = cadet_id);
CREATE POLICY "Officers can view all transactions" ON transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'officer')
);
CREATE POLICY "Officers can create transactions" ON transactions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'officer')
);
