# Interior Systems - Complete Deployment Guide

This guide walks you through deploying Interior Systems from scratch.

## Prerequisites

Before you begin, ensure you have:

- [x] Node.js 20.x or higher installed
- [x] npm 10.x or higher
- [x] Git installed
- [x] A GitHub account
- [x] A Supabase account (free tier)
- [x] A Cloudflare account (free tier)
- [x] A Codecov account (optional, for coverage reports)

## Step 1: Fork and Clone Repository

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/interior-systems.git
cd interior-systems

# Install dependencies
npm install
cd workers && npm install && cd ..
```

## Step 2: Set Up Supabase

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and fill in:
   - **Name**: interior-systems
   - **Database Password**: (generate strong password)
   - **Region**: Choose closest to your users
4. Click "Create new project"

### 2.2 Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxx.supabase.co`
   - **Anon/public key**: `eyJhbG...`
   - **Service role key**: `eyJhbG...` (keep secret!)

### 2.3 Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

Alternatively, run migrations manually:

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Click "Run"
4. Repeat for `002_seed_data.sql`

### 2.4 Configure Storage

1. Go to **Storage** in Supabase Dashboard
2. Create buckets:
   - `project-images` (public)
   - `project-files` (private)
3. Set policies for authenticated users

### 2.5 Enable Realtime

1. Go to **Database** → **Replication**
2. Enable replication for:
   - `projects`
   - `rooms`
   - `objects`
   - `collaborations`

## Step 3: Set Up Cloudflare Workers

### 3.1 Create Cloudflare Account

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Go to **Workers & Pages**
3. Note your **Account ID** (in URL or sidebar)

### 3.2 Create API Token

1. Go to **My Profile** → **API Tokens**
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Set permissions:
   - Account → Workers Scripts → Edit
   - Account → Workers KV Storage → Edit
5. Click "Continue to summary" → "Create Token"
6. Copy the token (you'll only see it once!)

### 3.3 Create KV Namespace

```bash
cd workers

# Login to Cloudflare
npx wrangler login

# Create KV namespace
npx wrangler kv:namespace create "RATE_LIMITER"

# Copy the ID from output and update wrangler.toml
# Replace "your_kv_namespace_id" with actual ID
```

### 3.4 Configure Worker Secrets

```bash
cd workers

# Set Supabase secrets
npx wrangler secret put SUPABASE_URL
# Paste your Supabase URL when prompted

npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# Paste your service role key when prompted
```

### 3.5 Deploy Worker

```bash
cd workers
npm run deploy
```

Note the worker URL (e.g., `https://interior-systems-worker.YOUR_SUBDOMAIN.workers.dev`)

### 3.6 Configure Cron Trigger

The cron is already configured in `wrangler.toml`. Verify it's active:

1. Go to **Workers & Pages** → Your Worker
2. Click **Triggers** tab
3. Confirm cron schedule: `0 0 * * *` (daily at midnight)

## Step 4: Configure GitHub Repository

### 4.1 Enable GitHub Pages

1. Go to your repository **Settings**
2. Click **Pages** in sidebar
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. Click **Save**

### 4.2 Add Repository Secrets

Go to **Settings** → **Secrets and variables** → **Actions**

Add the following secrets:

| Secret Name | Value | Where to Get |
|------------|-------|--------------|
| `SUPABASE_URL` | Your Supabase URL | Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Your anon key | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Supabase → Settings → API |
| `CLOUDFLARE_ACCOUNT_ID` | Your account ID | Cloudflare → Account |
| `CLOUDFLARE_API_TOKEN` | Your API token | Created in step 3.2 |
| `CODECOV_TOKEN` | Your Codecov token | codecov.io (optional) |

### 4.3 Update Environment Variables

Edit `.env.example` and create `.env`:

```bash
cp .env.example .env
```

Fill in your actual values:

```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

CLOUDFLARE_ACCOUNT_ID=abc123...
CLOUDFLARE_API_TOKEN=xyz789...

VITE_APP_URL=https://bedwards.github.io/interior-systems
```

## Step 5: Deploy Frontend

### 5.1 Update Package URLs

In `package.json`, update the homepage:

```json
{
  "homepage": "https://YOUR_USERNAME.github.io/interior-systems"
}
```

In `vite.config.ts`, update base:

```typescript
export default defineConfig({
  base: '/interior-systems/',
  // ...
});
```

### 5.2 Push to GitHub

```bash
git add .
git commit -m "feat: initial deployment configuration"
git push origin main
```

This will trigger the GitHub Actions workflow:
1. Run tests
2. Build frontend
3. Deploy to GitHub Pages
4. Deploy Worker

### 5.3 Verify Deployment

Check GitHub Actions:
1. Go to **Actions** tab
2. Watch the "CI" workflow run
3. Ensure all jobs succeed (green checkmarks)

Access your app:
- Frontend: `https://YOUR_USERNAME.github.io/interior-systems/`
- Worker: `https://interior-systems-worker.YOUR_SUBDOMAIN.workers.dev/health`

## Step 6: Configure OAuth Providers (Optional)

### 6.1 Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Authorized redirect URIs**:
     ```
     https://YOUR_PROJECT.supabase.co/auth/v1/callback
     ```
5. Copy Client ID and Client Secret
6. In Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Enable Google
   - Paste Client ID and Secret
   - Click **Save**

### 6.2 GitHub OAuth

1. Go to GitHub **Settings** → **Developer settings**
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name**: Interior Systems
   - **Homepage URL**: `https://YOUR_USERNAME.github.io/interior-systems/`
   - **Authorization callback URL**:
     ```
     https://YOUR_PROJECT.supabase.co/auth/v1/callback
     ```
4. Copy Client ID and generate Client Secret
5. In Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Enable GitHub
   - Paste Client ID and Secret
   - Click **Save**

## Step 7: Set Up Codecov (Optional)

1. Go to [codecov.io](https://codecov.io)
2. Sign in with GitHub
3. Add repository "interior-systems"
4. Copy the upload token
5. Add as `CODECOV_TOKEN` secret in GitHub

## Step 8: Final Testing

### 8.1 Test Authentication

1. Visit your deployed app
2. Click "Sign Up"
3. Create an account with email
4. Verify email (check inbox)
5. Sign in

### 8.2 Test Core Features

- [ ] Create a project
- [ ] Add a room
- [ ] Draw objects on canvas
- [ ] Save project
- [ ] Go offline (disable network)
- [ ] Make changes
- [ ] Go online
- [ ] Verify changes synced

### 8.3 Test Worker Endpoints

```bash
# Get your auth token from browser localStorage
TOKEN="your_jwt_token"

# Test lighting calculation
curl -X POST https://interior-systems-worker.YOUR_SUBDOMAIN.workers.dev/api/lighting-calc \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roomArea": 25, "ceilingHeight": 3, "naturalLight": "medium", "activity": "living"}'
```

## Troubleshooting

### Issue: GitHub Actions Failing

**Check:**
- All secrets are set correctly
- Supabase project is active
- Cloudflare token has correct permissions

**Fix:**
```bash
# Re-run failed job from Actions tab
# or push empty commit to trigger again
git commit --allow-empty -m "chore: trigger ci"
git push
```

### Issue: Worker Not Deploying

**Check:**
- KV namespace ID is correct in `wrangler.toml`
- API token is valid
- Account ID is correct

**Fix:**
```bash
cd workers
npx wrangler whoami  # Verify logged in
npx wrangler deploy  # Manual deploy
```

### Issue: Database Connection Error

**Check:**
- Supabase project is running (not paused)
- Anon key is correct
- Row Level Security policies are set

**Fix:**
- Verify credentials in `.env`
- Check RLS policies in Supabase Dashboard
- Review logs in Supabase → Logs

### Issue: CORS Errors

**Check:**
- Worker CORS configuration
- Frontend URL matches in Worker

**Fix:**
Update `workers/src/index.ts`:
```typescript
app.use('*', cors({
  origin: ['https://YOUR_USERNAME.github.io', 'http://localhost:5173'],
  credentials: true,
}));
```

### Issue: Offline Sync Not Working

**Check:**
- Service worker is registered
- IndexedDB is available
- Browser supports PWA features

**Fix:**
- Clear browser cache
- Unregister old service worker
- Check browser console for errors

## Monitoring

### Application Monitoring

1. **Supabase**:
   - Dashboard → Logs
   - Monitor database queries
   - Check API usage

2. **Cloudflare**:
   - Workers & Pages → Your Worker → Metrics
   - View request volume
   - Check error rates

3. **GitHub Pages**:
   - Settings → Pages
   - View deployment status
   - Check build logs

### Set Up Alerts

1. **Supabase**:
   - Enable email alerts for errors
   - Set up database usage alerts

2. **Cloudflare**:
   - Configure notification policies
   - Set CPU time alerts

## Maintenance

### Regular Tasks

**Daily:**
- Check error logs
- Monitor user feedback

**Weekly:**
- Review dependency updates
- Check test coverage
- Review performance metrics

**Monthly:**
- Update dependencies
- Review and optimize queries
- Backup database

### Database Backups

Supabase automatically backs up your database. To create manual backup:

```bash
# Dump database
supabase db dump > backup-$(date +%Y%m%d).sql

# Store securely off-site
```

### Updates

```bash
# Update dependencies
npm update
cd workers && npm update && cd ..

# Test locally
npm run test
npm run dev

# Deploy
git add package*.json workers/package*.json
git commit -m "chore: update dependencies"
git push
```

## Production Checklist

Before announcing your app:

- [ ] All tests passing
- [ ] > 90% code coverage
- [ ] SSL/HTTPS enabled
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Monitoring set up
- [ ] Error tracking enabled
- [ ] Rate limiting working
- [ ] Authentication tested
- [ ] OAuth providers working
- [ ] Mobile responsive
- [ ] Accessibility tested
- [ ] Performance optimized (Lighthouse > 90)
- [ ] SEO configured
- [ ] Terms of Service added
- [ ] Privacy Policy added

## Scaling Considerations

### When to Upgrade

**Supabase:**
- > 2GB database size → Pro plan ($25/mo)
- > 500 concurrent users → Pro plan
- Need custom domain → Pro plan

**Cloudflare:**
- > 100,000 requests/day → Paid plan ($5/mo)
- Need longer CPU time → Unbound plan

**GitHub:**
- > 100GB bandwidth/month → Consider CDN
- Need private repo → GitHub Team

## Support

- **Documentation**: `docs/` directory
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: your-email@example.com

---

**Congratulations!** 🎉 Your Interior Systems app is now deployed and ready to democratize design intelligence!