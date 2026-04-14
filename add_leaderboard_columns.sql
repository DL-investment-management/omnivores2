-- Add leaderboard columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rank TEXT DEFAULT 'Novice';

-- Index for fast leaderboard queries
CREATE INDEX IF NOT EXISTS users_xp_desc ON users (xp DESC);
