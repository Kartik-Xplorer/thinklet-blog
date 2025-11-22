-- Create post_likes table to store user likes for posts
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hashnode_post_id TEXT, -- Hashnode post ID for syncing
  synced_to_hashnode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(post_id, user_id) -- Prevent duplicate likes
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created_at ON post_likes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Post likes policies
CREATE POLICY "Anyone can view post likes"
  ON post_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Note: No trigger needed for post_likes as it only has created_at, not updated_at

