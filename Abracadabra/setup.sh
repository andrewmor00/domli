#!/bin/bash

# Domli Real Estate Platform Setup Script
echo "🚀 Setting up Domli Real Estate Platform..."

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi

print_status "npm version: $(npm -v)"

# Install dependencies
print_status "Installing dependencies..."
npm run install:all

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Create log directories
print_status "Creating log directories..."
mkdir -p backend/logs
mkdir -p frontend/logs

# Setup environment files
print_status "Setting up environment files..."

# Backend environment
if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    print_warning "Backend .env file created. Please configure your database settings."
else
    print_status "Backend .env file already exists."
fi

# Frontend environment
if [ ! -f "frontend/.env" ]; then
    cp frontend/env.example frontend/.env
    print_status "Frontend .env file created."
else
    print_status "Frontend .env file already exists."
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 is not installed. Installing PM2 globally..."
    npm install -g pm2
    if [ $? -ne 0 ]; then
        print_error "Failed to install PM2"
        exit 1
    fi
fi

print_status "PM2 version: $(pm2 -v)"

# Build frontend
print_status "Building frontend..."
cd frontend
npm run build
cd ..

if [ $? -ne 0 ]; then
    print_error "Failed to build frontend"
    exit 1
fi

print_status "Setup completed successfully! 🎉"

echo ""
echo "📋 Next steps:"
echo "1. Configure your database settings in backend/.env"
echo "2. Run database migrations: cd backend && npm run migrate"
echo "3. Seed the database: cd backend && npm run seed"
echo "4. Start the application:"
echo "   - Development: npm run dev"
echo "   - Production: npm run start"
echo ""
echo "📚 For more information, see README.md"
echo "" 