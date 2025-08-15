# GitHub Secrets Setup

To deploy your calendar app to GitHub Pages, you need to set up repository secrets for the environment variables.

## Required Secrets

Set these secrets in your GitHub repository:

### 1. Go to Repository Settings
- Navigate to your repository: `https://github.com/khushal-lysto/event-calendar`
- Click on **Settings** tab
- In the left sidebar, click **Secrets and variables** → **Actions**

### 2. Add Repository Secrets

Click **New repository secret** and add these two secrets:

#### Secret 1:
- **Name**: `VITE_GOOGLE_CALENDAR_API_KEY`
- **Value**: `AIzaSyBCn9UMUuVSWbK4nn1J1twLl2uuMov1GNY`

#### Secret 2:
- **Name**: `VITE_GOOGLE_CALENDAR_ID`
- **Value**: `c_6da2d48d5ab1426c69aaf5a85c8e1266def90cec46d734e032f388441fc660f3@group.calendar.google.com`

### 3. How It Works

- The GitHub Actions workflow will use these secrets during the build process
- The secrets are injected as environment variables during the build
- Your app will work correctly on GitHub Pages
- The secrets are never exposed in the built code

### 4. Security Notes

- ✅ Repository secrets are encrypted and secure
- ✅ They're only accessible during GitHub Actions runs
- ✅ They're never logged or exposed in the repository
- ✅ They work with both public and private repositories

## After Setting Secrets

1. Push your code to trigger a new deployment
2. GitHub Actions will automatically build and deploy
3. Your app will be available at: `https://khushal-lysto.github.io/event-calendar`
