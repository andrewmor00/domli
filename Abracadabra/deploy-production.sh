#!/bin/bash

# Production deployment script for Domli

echo "🚀 Starting Domli Production Deployment..."

# Get the server's public IP
PUBLIC_IP=$(curl -s ifconfig.me)
echo "📍 Server Public IP: $PUBLIC_IP"

# Create .env file for production
cat > .env.production << EOF
# Database Configuration
DB_NAME=domli_db
DB_USER=postgres
DB_PASSWORD=$(openssl rand -base64 32)

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 64)
JWT_EXPIRES_IN=7d

# Frontend Configuration
VITE_API_URL=/api
FRONTEND_URL=http://$PUBLIC_IP

# Backend Configuration
NODE_ENV=production
PORT=3000
EOF

echo "✅ Created .env.production file"

# Stop any running containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start production containers
echo "🏗️  Building production containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
docker-compose -f docker-compose.prod.yml ps

# Show access information
echo ""
echo "✨ Deployment Complete!"
echo "================================"
echo "🌐 Access your application at:"
echo "   http://$PUBLIC_IP"
echo ""
echo "📊 API endpoint:"
echo "   http://$PUBLIC_IP/api"
echo ""
echo "🔒 Database credentials saved in .env.production"
echo "================================"
echo ""
echo "📝 To view logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 To stop the application:"
echo "   docker-compose -f docker-compose.prod.yml down" 