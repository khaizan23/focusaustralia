ALTER TABLE profiles 
ADD COLUMN phone TEXT,
ADD COLUMN birthdate DATE,
ADD COLUMN address TEXT,
ADD COLUMN bio TEXT,
ADD COLUMN gender TEXT,
ADD COLUMN height DECIMAL,
ADD COLUMN weight DECIMAL,
ADD COLUMN avatar_url TEXT,
ADD COLUMN company_name TEXT,
ADD COLUMN company_address TEXT,
ADD COLUMN industry TEXT,
ADD COLUMN verification_status TEXT DEFAULT 'pending';