#!/bin/bash

# Domli Production Deployment Script
echo "🚀 Deploying Domli to production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in production mode
if [ "$NODE_ENV" != "production" ]; then
    print_warning "Setting NODE_ENV to production"
    export NODE_ENV=production
fi

# Stop existing processes
print_status "Stopping existing processes..."
pm2 stop ecosystem.config.js 2>/dev/null || true
pm2 delete ecosystem.config.js 2>/dev/null || true

# Install dependencies
print_status "Installing dependencies..."
npm run install:all

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Build frontend
print_status "Building frontend for production..."
cd frontend
npm run build
cd ..

if [ $? -ne 0 ]; then
    print_error "Failed to build frontend"
    exit 1
fi

# Run database migrations
print_status "Running database migrations..."
cd backend
npm run migrate
cd ..

if [ $? -ne 0 ]; then
    print_error "Failed to run database migrations"
    exit 1
fi

# Start with PM2
print_status "Starting applications with PM2..."
pm2 start ecosystem.config.js --env production

if [ $? -ne 0 ]; then
    print_error "Failed to start applications with PM2"
    exit 1
fi

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup

print_status "Deployment completed successfully! 🎉"

echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "📋 Useful commands:"
echo "  - View logs: npm run logs"
echo "  - Monitor: npm run monit"
echo "  - Restart: npm run restart"
echo "  - Stop: npm run stop"
echo "" 