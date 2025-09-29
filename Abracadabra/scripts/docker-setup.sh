#!/bin/bash

# Domli Docker Setup Script
echo "🚀 Setting up Domli with Docker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi

    print_status "Docker version: $(docker --version)"
    print_status "Docker Compose version: $(docker-compose --version)"
}

# Create environment files
setup_environment() {
    print_header "Setting up environment files"
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=domli_db
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF
        print_status "Created backend/.env"
    else
        print_status "backend/.env already exists"
    fi

    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << EOF
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_NODE_ENV=development
EOF
        print_status "Created frontend/.env"
    else
        print_status "frontend/.env already exists"
    fi
}

# Build and start containers
start_application() {
    print_header "Building and starting application"
    
    print_status "Building Docker images..."
    docker-compose build
    
    print_status "Starting services..."
    docker-compose up -d
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_status "All services are running!"
    else
        print_error "Some services failed to start. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_header "Running database migrations"
    
    print_status "Running migrations..."
    docker-compose exec backend npm run migrate
    
    print_status "Seeding database..."
    docker-compose exec backend npm run seed
}

# Show status and URLs
show_status() {
    print_header "Application Status"
    
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend API: http://localhost:3000"
    echo "   Health Check: http://localhost:3000/health"
    echo ""
    echo "📊 Container Status:"
    docker-compose ps
    echo ""
    echo "📋 Useful Commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop app: docker-compose down"
    echo "   Restart: docker-compose restart"
    echo "   Update: docker-compose pull && docker-compose up -d"
    echo ""
}

# Main execution
main() {
    print_header "Domli Docker Setup"
    
    check_docker
    setup_environment
    start_application
    run_migrations
    show_status
    
    print_status "Setup completed successfully! 🎉"
    echo ""
    print_warning "Don't forget to change the JWT_SECRET in backend/.env for production!"
}

# Run main function
main 