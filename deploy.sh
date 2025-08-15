#!/bin/bash

echo "🚀 Starting deployment to GitHub Pages..."

# Build the project
echo "📦 Building the project..."
pnpm run build

# Deploy to GitHub Pages
echo "🌐 Deploying to GitHub Pages..."
pnpm run deploy

echo "✅ Deployment completed!"
echo "🌍 Your app should be available at: https://khushal-lysto.github.io/event-calendar"
