-- Migration: Add username column to faith_and_worship.post and populate from auth.users
-- This migration:
-- 1. Adds a username column to faith_and_worship.post if it doesn't exist
-- 2. Updates existing posts with display_name from auth.users.raw_user_meta_data
-- 3. Creates a trigger to automatically populate username for new posts

-- Step 1: Add username column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'faith_and_worship' 
        AND table_name = 'post' 
        AND column_name = 'username'
    ) THEN
        ALTER TABLE faith_and_worship.post 
        ADD COLUMN username TEXT;
    END IF;
END $$;

-- Step 2: Update existing posts with display_name from auth.users
-- This uses a SECURITY DEFINER function to access auth.users table
CREATE OR REPLACE FUNCTION faith_and_worship.update_post_usernames()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE faith_and_worship.post p
    SET username = COALESCE(
        (u.raw_user_meta_data->>'display_name')::TEXT,
        u.email,
        'Anonymous'
    )
    FROM auth.users u
    WHERE p.user_id = u.id
    AND (p.username IS NULL OR p.username = '');
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION faith_and_worship.update_post_usernames() TO authenticated;
GRANT EXECUTE ON FUNCTION faith_and_worship.update_post_usernames() TO anon;

-- Run the update function
SELECT faith_and_worship.update_post_usernames();

-- Step 3: Create a function to get display_name for a user_id
CREATE OR REPLACE FUNCTION faith_and_worship.get_user_display_name(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    display_name_val TEXT;
BEGIN
    SELECT COALESCE(
        (raw_user_meta_data->>'display_name')::TEXT,
        email,
        'Anonymous'
    ) INTO display_name_val
    FROM auth.users
    WHERE id = user_uuid;
    
    RETURN display_name_val;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION faith_and_worship.get_user_display_name(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION faith_and_worship.get_user_display_name(UUID) TO anon;

-- Step 4: Create a trigger function to automatically set username on insert
CREATE OR REPLACE FUNCTION faith_and_worship.set_post_username()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.username IS NULL OR NEW.username = '' THEN
        NEW.username := faith_and_worship.get_user_display_name(NEW.user_id);
    END IF;
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_set_post_username ON faith_and_worship.post;
CREATE TRIGGER trigger_set_post_username
    BEFORE INSERT OR UPDATE ON faith_and_worship.post
    FOR EACH ROW
    EXECUTE FUNCTION faith_and_worship.set_post_username();

