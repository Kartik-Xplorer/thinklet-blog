# Hashnode Authentication Token Setup

## Overview

To sync comments from Supabase to Hashnode, you need a **Hashnode Personal Access Token (PAT)** with the appropriate permissions.

## Required Token Scope

Based on the Hashnode GraphQL API, the token needs the following scope:

- **`publish_comment`** - Required to create comments via the `addComment` mutation

## How to Get Your Hashnode Personal Access Token

### Step 1: Log in to Hashnode

1. Go to [https://hashnode.com](https://hashnode.com)
2. Log in to your account

### Step 2: Navigate to Developer Settings

1. Click on your profile picture (top right)
2. Go to **Settings**
3. Navigate to **Developer** section (or go directly to [https://hashnode.com/settings/developer](https://hashnode.com/settings/developer))

### Step 3: Create a Personal Access Token

1. Click on **"Generate New Token"** or **"Create Token"**
2. Give your token a descriptive name (e.g., "Blog Comment Sync")
3. **Select the scope**: Make sure to check **`publish_comment`** scope
4. Click **"Generate"** or **"Create"**
5. **IMPORTANT**: Copy the token immediately - you won't be able to see it again!

### Step 4: Add Token to Environment Variables

Add the token to your `.env.local` file:

```env
HASHNODE_AUTH_TOKEN=your_personal_access_token_here
```

**Security Note**: 
- Never commit this token to version control
- Add `.env.local` to your `.gitignore` file
- For production, use your hosting platform's environment variable settings (Vercel, Netlify, etc.)

## Token Format

The token will look something like this:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

It's a long alphanumeric string (typically 40+ characters).

## Verification

To verify your token works, you can test it with a simple GraphQL query:

```bash
curl -X POST https://gql.hashnode.com \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { me { id username } }"
  }'
```

If successful, you should get your user information back.

## Troubleshooting

### Token Not Working

1. **Check token scope**: Ensure `publish_comment` scope is selected
2. **Verify token format**: Make sure there are no extra spaces or line breaks
3. **Check expiration**: Tokens don't expire by default, but verify in settings
4. **Test with GraphQL Playground**: Use [https://gql.hashnode.com](https://gql.hashnode.com) to test your token

### Common Errors

- **401 Unauthorized**: Token is invalid or missing
- **403 Forbidden**: Token doesn't have the required `publish_comment` scope
- **Token not found**: Make sure `HASHNODE_AUTH_TOKEN` is set in your environment variables

## Alternative: Using Hashnode Session (Not Recommended)

If you don't want to use a Personal Access Token, you could potentially use Hashnode session cookies, but this is:
- More complex to implement
- Less secure
- Requires maintaining user sessions
- Not recommended for server-side operations

**Recommendation**: Always use Personal Access Tokens for server-to-server API calls.

## Security Best Practices

1. ✅ Store tokens in environment variables only
2. ✅ Never commit tokens to git
3. ✅ Rotate tokens periodically
4. ✅ Use different tokens for different environments (dev/staging/prod)
5. ✅ Revoke tokens if compromised
6. ✅ Use the minimum required scopes

## Additional Resources

- [Hashnode API Documentation](https://apidocs.hashnode.com)
- [Hashnode GraphQL Playground](https://gql.hashnode.com)
- [Hashnode Developer Settings](https://hashnode.com/settings/developer)

