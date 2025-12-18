#!/bin/bash

# Exit on error
set -e

# Variables
BUILD_DIR="dist"
GH_BRANCH="gh-pages"
CUSTOM_DOMAIN="spectromodel.com"

# Step 1: Build the project
echo "Building the project..."
npm install
npm run build

# Step 2: Switch to gh-pages branch
echo "Switching to $GH_BRANCH branch..."
git checkout $GH_BRANCH || git checkout -b $GH_BRANCH

# Step 3: Remove old files
echo "Cleaning old files..."
rm -rf *

# Step 4: Copy build files
echo "Copying new build..."
cp -r ../$BUILD_DIR/* .

# Step 5: Add CNAME for custom domain
echo $CUSTOM_DOMAIN > CNAME

# Step 6: Commit and push
echo "Committing and pushing..."
git add .
git commit -m "Deploy Vite build to GitHub Pages"
git push origin $GH_BRANCH --force

echo "✅ Deployment complete!"


