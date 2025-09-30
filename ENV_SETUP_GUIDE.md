# 🔑 Environment Setup Guide for Gopher

## Problem
Your app is not working because the API keys in `.env.local` are empty.

## Quick Fix Instructions

### Step 1: Get Your Supabase Keys
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (or create one if you haven't)
3. Click on **Settings** (gear icon) → **API**
4. Copy these values:
   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon/Public Key** → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Step 2: Get Your OpenAI API Key
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Name it "Gopher Development"
4. Copy the key → This is your `OPENAI_API_KEY`
5. **Important**: Save this key immediately, you won't be able to see it again!

### Step 3: Update Your .env.local File

Open `gopher-app/.env.local` and update it with your keys:

```env
# Gopher App - Local Environment Variables
# Fill in values then restart with npm run dev

# Replace these with your actual values from Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-service-key

# Replace with your OpenAI API key
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...your-openai-key

# These can stay as-is for local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_SECRET=dev-session-secret-change-me
NODE_ENV=development

# Optional - leave empty for now
FEATURE_FLAGS=
REDIS_URL=
API_RATE_LIMIT_PER_MINUTE=10
SENTRY_DSN=
VERCEL_ANALYTICS_ID=
```

### Step 4: Restart Your Development Server
After updating the `.env.local` file:
```bash
# Stop the server (Ctrl+C) then restart
npm run dev
```

## 🧪 Testing Your Setup

After adding your keys, you can test them using these endpoints:

1. **Test Supabase**: Visit http://localhost:3000/api/test-supabase
2. **Test OpenAI**: Visit http://localhost:3000/api/ai/health

Both should return success messages if configured correctly.

## ⚠️ Security Reminders

1. **Never commit `.env.local` to Git** - It's already in .gitignore
2. **Keep your Service Role Key secret** - Never expose it to the client
3. **OpenAI keys cost money** - Monitor your usage at https://platform.openai.com/usage
4. **Use different keys for production** - Don't use the same keys in production

## 🔍 Troubleshooting

If it's still not working after adding keys:

1. **Check for typos** - Keys are case-sensitive
2. **Check for extra spaces** - Remove any spaces before/after keys
3. **Check quotes** - Don't wrap keys in quotes unless they contain special characters
4. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```
5. **Check Supabase project status** - Make sure your project is not paused

## Need Help?

If you're still having issues:
1. Run the test script: `node test-env.js`
2. Check the browser console for errors
3. Check the terminal for server-side errors

