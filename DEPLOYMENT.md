# Deployment Guide - GitHub Pages

This guide will help you deploy your React Calendar app to GitHub Pages.

## Prerequisites

- A GitHub account
- Your project pushed to a GitHub repository
- Node.js and pnpm installed locally

## Setup Steps

### 1. Repository Setup

1. Create a new repository on GitHub (if you haven't already)
2. Push your code to the repository
3. Make sure your repository is public (required for free GitHub Pages)

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Choose the branch (usually `main` or `master`)
6. Select the folder `/ (root)` or `/docs`
7. Click "Save"

### 3. Configure GitHub Pages Source

- **Option A**: Use the `gh-pages` branch (recommended)
- **Option B**: Use the `/docs` folder in your main branch

## Deployment Methods

### Method 1: Automatic Deployment (Recommended)

The GitHub Actions workflow will automatically deploy your app whenever you push to the main branch.

1. Push your changes to the main branch
2. GitHub Actions will automatically build and deploy
3. Check the Actions tab to monitor the deployment

### Method 2: Manual Deployment

Run the deployment script:

```bash
./deploy.sh
```

Or run the commands manually:

```bash
# Build the project
pnpm run build

# Deploy to GitHub Pages
pnpm run deploy
```

### Method 3: Using npm scripts

```bash
npm run deploy
```

## Configuration Details

### Package.json Changes

- Added `homepage` field with your GitHub Pages URL
- Added `predeploy` and `deploy` scripts
- Installed `gh-pages` as a dev dependency

### Vite Configuration

- Added `base: '/event-calendar/'` to handle the repository name in the URL

## Troubleshooting

### Common Issues

1. **404 Errors**: Make sure the `base` path in `vite.config.js` matches your repository name
2. **Build Failures**: Check that all dependencies are properly installed
3. **Deployment Issues**: Verify that GitHub Pages is enabled and the source branch is correct

### Check Deployment Status

1. Go to your repository's Actions tab
2. Look for the latest workflow run
3. Check the build and deploy steps for any errors

### Manual Verification

After deployment, you can verify by:
1. Checking the GitHub Pages settings
2. Visiting your deployed URL
3. Checking the `gh-pages` branch in your repository

## URLs

- **Local Development**: `http://localhost:5173`
- **Production**: `https://khushal-lysto.github.io/event-calendar`

## Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Verify your repository settings
3. Ensure all configuration files are properly set up
