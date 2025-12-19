# Complete Setup Guide: GitHub + Vercel Deployment

## Step 1: Push Code to GitHub

### If you already have a GitHub repository:

1. **Get your GitHub repository URL** (it will look like):
   - `https://github.com/YOUR_USERNAME/REPO_NAME.git` OR
   - `git@github.com:YOUR_USERNAME/REPO_NAME.git`

2. **Add the remote and push:**
   ```bash
   git remote add origin YOUR_REPO_URL_HERE
   git branch -M main
   git push -u origin main
   ```

### If you need to create a new GitHub repository:

1. Go to https://github.com/new
2. Repository name: `weather-route-visualizer` (or any name you prefer)
3. Description: "Weather Route Visualizer for Truck Dispatchers"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

7. **Then run these commands** (GitHub will show you these after creating the repo):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Website (Easiest - Recommended)

1. **Go to Vercel**: https://vercel.com/new
   - If you don't have an account, sign up (free) with your GitHub account

2. **Import Your GitHub Repository**:
   - Click "Import Project"
   - You'll see a list of your GitHub repositories
   - Click on your `weather-route-visualizer` repository
   - Click "Import"

3. **Configure Project Settings** (Vercel should auto-detect these):
   - **Framework Preset**: Vite (should be auto-detected)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build` (should be auto-filled)
   - **Output Directory**: `dist` (should be auto-filled)
   - **Install Command**: `npm install` (should be auto-filled)

4. **Deploy**:
   - Click "Deploy" button
   - Wait 1-2 minutes for the build to complete

5. **Your Site is Live!**
   - Vercel will give you a URL like: `https://weather-route-visualizer.vercel.app`
   - Share this URL with others!

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```
   - This will open your browser to authenticate

3. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts:
     - Set up and deploy? → `Y`
     - Which scope? → Select your account
     - Link to existing project? → `N` (first time) or `Y` (if already deployed)
     - Project name? → Press Enter (uses folder name) or type a name
     - Directory? → Press Enter (uses current directory `./`)

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Step 3: Verify Deployment

1. Visit your Vercel URL (e.g., `https://weather-route-visualizer.vercel.app`)
2. Test the application:
   - Enter origin and destination
   - Add pickup and delivery dates
   - Verify weather data loads correctly
   - Check that the map displays properly

## Step 4: Future Updates

### Automatic Deployments (if connected via GitHub)

Every time you push to GitHub, Vercel will automatically deploy:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically:
1. Detect the push
2. Build your project
3. Deploy the new version
4. Update your live site

### Manual Deploy (if using CLI)

```bash
vercel --prod
```

## Troubleshooting

### Build Fails on Vercel?

1. Check the build logs in Vercel dashboard
2. Common issues:
   - Missing dependencies → Check `package.json`
   - TypeScript errors → Fix errors locally first
   - Missing environment variables → Add in Vercel dashboard

### API Keys Not Working?

- The API keys are currently in the code
- They will work on Vercel as-is
- For better security, you could move them to environment variables (optional)

### Site Works Locally But Not on Vercel?

- Check browser console for errors
- Verify all API endpoints are accessible
- Check Vercel build logs for warnings

## Quick Reference Commands

```bash
# Initialize git (already done)
git init

# Add all files (already done)
git add .

# Commit (already done)
git commit -m "Initial commit"

# Add GitHub remote (YOU NEED TO DO THIS)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main

# Deploy to Vercel (after GitHub is set up)
# Go to vercel.com/new and import your repo
```

