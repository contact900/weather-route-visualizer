# Deployment Guide for Vercel

## Step-by-Step Instructions to Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended for first-time setup)

1. **Install Vercel CLI globally** (if you haven't already)
   ```bash
   npm install -g vercel
   ```

2. **Navigate to your project directory**
   ```bash
   cd "C:\Users\hgshr\Downloads\Weather Data TL"
   ```

3. **Login to Vercel**
   ```bash
   vercel login
   ```
   - This will open your browser to authenticate
   - Follow the prompts to log in with your GitHub, GitLab, or email

4. **Deploy to Vercel**
   ```bash
   vercel
   ```
   - When prompted:
     - "Set up and deploy?" → Type `Y` and press Enter
     - "Which scope?" → Select your account
     - "Link to existing project?" → Type `N` and press Enter (for first deployment)
     - "What's your project's name?" → Type a name (e.g., `weather-route-visualizer`) or press Enter for default
     - "In which directory is your code located?" → Press Enter (uses current directory `./`)
     - Vercel will auto-detect Vite framework

5. **Deploy to production**
   After the initial deployment, you can deploy to production:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard (GitHub Integration)

1. **Initialize Git repository** (if not already done)
   ```bash
   cd "C:\Users\hgshr\Downloads\Weather Data TL"
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a GitHub repository**
   - Go to https://github.com/new
   - Create a new repository (e.g., `weather-route-visualizer`)
   - Do NOT initialize with README, .gitignore, or license (since you already have files)

3. **Push your code to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/weather-route-visualizer.git
   git branch -M main
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your GitHub username)

4. **Import project to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect the settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`
   - Click "Deploy"

5. **Wait for deployment**
   - Vercel will build and deploy your project
   - You'll get a URL like: `https://weather-route-visualizer.vercel.app`

### Post-Deployment Notes

**Important:** Your API keys are currently hardcoded in the source code. For production:

1. **Consider using Environment Variables** (Recommended for security)
   - In Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     - `VITE_OPEN_ROUTE_KEY` = `eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjYwOTQ5NjE1MmM3YTRmYjY5YTE1MzgzYWQ5MDI4MTQwIiwiaCI6Im11cm11cjY0In0=`
     - `VITE_OPEN_WEATHER_KEY` = `bbdf0ae173d5370002eb39a705baa0bf`
   - Then update `src/App.tsx` to use `import.meta.env.VITE_OPEN_ROUTE_KEY` instead of hardcoded values
   - **Note:** Since these are client-side APIs, the keys will still be visible in the browser. This is expected for these services.

2. **Custom Domain** (Optional)
   - In Vercel Dashboard → Your Project → Settings → Domains
   - Add your custom domain if you have one

3. **Automatic Deployments**
   - If connected to GitHub, every push to `main` branch will automatically deploy
   - You can configure branch-specific deployments in project settings

### Troubleshooting

- **Build fails?** Check the build logs in Vercel dashboard
- **404 errors on routes?** The `vercel.json` rewrite rules should handle this
- **API errors?** Ensure your API keys are correct and have sufficient quota

### Quick Deploy Command

Once set up, you can deploy anytime with:
```bash
vercel --prod
```

