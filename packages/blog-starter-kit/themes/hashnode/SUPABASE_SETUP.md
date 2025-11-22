# Supabase Integration Setup Guide

This guide will help you set up Supabase authentication and comments for your Hashnode blog theme.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Hashnode Personal Access Token (for syncing comments to Hashnode)

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and create a new project
2. Note down your project URL and anon key from Settings > API

## Step 2: Set Up Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Hashnode API (for syncing comments)
HASHNODE_AUTH_TOKEN=your_hashnode_personal_access_token
NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT=https://gql.hashnode.com
```

### Getting Hashnode Personal Access Token

1. Go to https://hashnode.com/settings/developer
2. Create a new Personal Access Token
3. Give it permissions for `PUBLISH_COMMENT` or similar
4. Copy the token and add it to your `.env.local`

## Step 3: Run Database Migrations

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_comments_schema.sql`
4. Run the migration

Alternatively, if you have the Supabase CLI installed:

```bash
supabase db push
```

## Step 4: Install Dependencies

```bash
pnpm install
```

## Step 5: Configure Supabase Auth

1. In your Supabase dashboard, go to Authentication > URL Configuration
2. Add your site URL and redirect URLs:
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: `http://localhost:3000/auth/callback`

3. **Disable Email Verification (Important for instant signup):**
   - Go to Authentication > Settings
   - Under "Email Auth", disable "Enable email confirmations"
   - This allows users to sign up and immediately start commenting without email verification
   - Users will be automatically logged in after signup

## Step 6: Update Comment Components (Optional)

If you want to use the enhanced comments component that includes Supabase comments:

1. Update `components/response-list.tsx` to use `PostCommentsEnhanced` instead of `PostComments`
2. Or directly replace the import in `components/post-comments-sidebar.tsx`

## How It Works

### Authentication Flow

1. Users sign up/sign in through Supabase Auth
2. User sessions are managed by Supabase
3. The `SupabaseAuthProvider` wraps the app and provides auth state

### Comments Flow

1. **User submits comment:**
   - Comment is saved to Supabase `comments` table
   - Comment is immediately displayed from Supabase

2. **Background sync to Hashnode:**
   - API route `/api/comments/create` syncs the comment to Hashnode
   - Uses Hashnode's `addComment` GraphQL mutation
   - Updates Supabase record with Hashnode comment ID

3. **Display:**
   - Comments from Supabase are shown first
   - Hashnode comments (if enabled) are shown below
   - Both are merged in the UI

## Database Schema

### `profiles` table
- Stores user profile information
- Automatically created when a user signs up
- Linked to `auth.users` via foreign key

### `comments` table
- Stores all comments
- Supports nested replies via `parent_comment_id`
- Tracks sync status to Hashnode
- Indexed for performance

## API Routes

### `POST /api/comments/create`
- Creates a new comment in Supabase
- Syncs to Hashnode in the background
- Requires authentication

### `GET /api/comments/[postId]`
- Fetches all comments for a post
- Includes nested replies
- Public endpoint (no auth required for reading)

### `GET /api/auth/session`
- Returns current user session
- Used for authenticated API calls

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only edit/delete their own comments
- Comments are publicly readable
- Authentication required to create comments

## Troubleshooting

### Comments not syncing to Hashnode

1. Check that `HASHNODE_AUTH_TOKEN` is set correctly
2. Verify the token has the correct permissions
3. Check server logs for sync errors

### Authentication not working

1. Verify Supabase environment variables are set
2. Check that redirect URLs are configured in Supabase dashboard
3. Ensure `SupabaseAuthProvider` wraps your app in `_app.tsx`

### Database errors

1. Verify migrations have been run
2. Check that RLS policies are correctly set up
3. Verify foreign key relationships are correct

## Next Steps

- Customize the comment form UI
- Add comment moderation features
- Implement comment reactions
- Add email notifications for replies

