# Troubleshooting Guide

## "Failed to save comment" Error

If you're seeing "Failed to save comment" errors, check the following:

### 1. Verify Supabase Environment Variables

Make sure these are set in your `.env.local` file (for local development) or in your Vercel/deployment environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**To get these values:**
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" (this is your `NEXT_PUBLIC_SUPABASE_URL`)
4. Copy the "anon public" key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

**Important:** The URL should look like `https://xxxxxxxxxxxxx.supabase.co` (not `zqarkipknafctdfkyiif.supabase.co` which appears to be a placeholder)

### 2. Verify Database Migrations Are Run

The comments system requires database tables to be created. Run the migration:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_comments_schema.sql`
4. Click "Run" to execute the migration

This will create:
- `profiles` table
- `comments` table
- Row Level Security (RLS) policies
- Automatic profile creation trigger

### 3. Check Row Level Security (RLS) Policies

Make sure RLS is enabled and policies are correct:

1. Go to Supabase dashboard > Table Editor
2. Click on the `comments` table
3. Go to "Policies" tab
4. Verify these policies exist:
   - "Anyone can view comments" (SELECT, using: true)
   - "Authenticated users can create comments" (INSERT, with check: auth.role() = 'authenticated')
   - "Users can update their own comments" (UPDATE, using: auth.uid() = user_id)
   - "Users can delete their own comments" (DELETE, using: auth.uid() = user_id)

### 4. Verify Authentication is Working

1. Try signing up a new user
2. Check if a profile is automatically created in the `profiles` table
3. If no profile is created, the trigger might not be set up correctly

### 5. Check Browser Console for Errors

Open browser DevTools (F12) and check:
- Network tab: Look for failed requests to `/api/comments/create`
- Console tab: Look for error messages

Common errors:
- `ERR_NAME_NOT_RESOLVED`: Supabase URL is incorrect
- `401 Unauthorized`: Authentication token is invalid or expired
- `500 Internal Server Error`: Check server logs for details

### 6. Verify Supabase Project is Active

Make sure your Supabase project is not paused. Free tier projects pause after inactivity.

1. Go to Supabase dashboard
2. Check if your project shows as "Active"
3. If paused, click "Restore" to reactivate

### 7. Test Database Connection

You can test if the database is accessible by:

1. Going to Supabase dashboard > Table Editor
2. Try viewing the `comments` table
3. If the table doesn't exist, run the migration (see step 2)

## Common Error Messages

### "Server configuration error: Supabase not configured"
- **Solution:** Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables

### "Comments table not found"
- **Solution:** Run the database migration from `supabase/migrations/001_comments_schema.sql`

### "Permission denied"
- **Solution:** Check RLS policies are set up correctly (see step 3)

### "Unauthorized: Invalid or expired token"
- **Solution:** Sign out and sign in again to refresh your session

## Still Having Issues?

1. Check server logs (Vercel logs or local terminal)
2. Verify all environment variables are set correctly
3. Make sure you've run the database migrations
4. Test with a fresh user account

