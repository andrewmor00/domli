#!/bin/bash

# Domli Server Migration Script
echo "🚀 Migrating Domli to new Ubuntu server..."

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

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Update system
update_system() {
    print_header "Updating Ubuntu system"
    
    print_status "Updating package list..."
    apt update
    
    print_status "Upgrading packages..."
    apt upgrade -y
    
    print_status "Installing essential packages..."
    apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
}

# Install Docker
install_docker() {
    print_header "Installing Docker"
    
    print_status "Removing old Docker versions..."
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    print_status "Installing Docker dependencies..."
    apt install -y ca-certificates curl gnupg lsb-release
    
    print_status "Adding Docker GPG key..."
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    print_status "Adding Docker repository..."
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    print_status "Updating package list..."
    apt update
    
    print_status "Installing Docker..."
    apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    print_status "Starting Docker service..."
    systemctl start docker
    systemctl enable docker
    
    print_status "Adding current user to docker group..."
    usermod -aG docker $SUDO_USER
    
    print_status "Docker version: $(docker --version)"
}

# Install Docker Compose
install_docker_compose() {
    print_header "Installing Docker Compose"
    
    print_status "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    print_status "Docker Compose version: $(docker-compose --version)"
}

# Setup firewall
setup_firewall() {
    print_header "Setting up firewall"
    
    print_status "Installing UFW..."
    apt install -y ufw
    
    print_status "Configuring firewall rules..."
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp
    ufw allow 5173/tcp
    
    print_status "Enabling firewall..."
    ufw --force enable
    
    print_status "Firewall status:"
    ufw status
}

# Create application directory
setup_app_directory() {
    print_header "Setting up application directory"
    
    APP_DIR="/opt/domli"
    
    print_status "Creating application directory: $APP_DIR"
    mkdir -p $APP_DIR
    cd $APP_DIR
    
    print_status "Setting proper permissions..."
    chown -R $SUDO_USER:$SUDO_USER $APP_DIR
}

# Clone repository
clone_repository() {
    print_header "Cloning repository"
    
    cd /opt/domli
    
    print_warning "Please provide your Git repository URL:"
    read -p "Git repository URL: " REPO_URL
    
    print_status "Cloning repository..."
    git clone $REPO_URL .
    
    print_status "Setting proper permissions..."
    chown -R $SUDO_USER:$SUDO_USER .
}

# Setup environment
setup_environment() {
    print_header "Setting up environment"
    
    cd /opt/domli
    
    print_status "Creating environment files..."
    
    # Backend environment
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

    # Frontend environment
    cat > frontend/.env << EOF
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_NODE_ENV=development
EOF

    print_status "Setting proper permissions..."
    chown -R $SUDO_USER:$SUDO_USER .
}

# Start application
start_application() {
    print_header "Starting application"
    
    cd /opt/domli
    
    print_status "Building Docker images..."
    docker-compose build
    
    print_status "Starting services..."
    docker-compose up -d
    
    print_status "Waiting for services to be ready..."
    sleep 15
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_status "All services are running!"
    else
        print_error "Some services failed to start. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Setup database
setup_database() {
    print_header "Setting up database"
    
    cd /opt/domli
    
    print_status "Running database migrations..."
    docker-compose exec -T backend npm run migrate
    
    print_status "Seeding database..."
    docker-compose exec -T backend npm run seed
}

# Setup systemd service (optional)
setup_systemd_service() {
    print_header "Setting up systemd service"
    
    cat > /etc/systemd/system/domli.service << EOF
[Unit]
Description=Domli Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/domli
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    print_status "Enabling systemd service..."
    systemctl enable domli.service
    
    print_status "Systemd service created. Use:"
    echo "  systemctl start domli"
    echo "  systemctl stop domli"
    echo "  systemctl status domli"
}

# Show final status
show_final_status() {
    print_header "Migration Complete!"
    
    echo ""
    echo "🎉 Domli has been successfully migrated to your new server!"
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend: http://$(hostname -I | awk '{print $1}'):5173"
    echo "   Backend API: http://$(hostname -I | awk '{print $1}'):3000"
    echo "   Health Check: http://$(hostname -I | awk '{print $1}'):3000/health"
    echo ""
    echo "📊 Container Status:"
    cd /opt/domli && docker-compose ps
    echo ""
    echo "📋 Useful Commands:"
    echo "   View logs: cd /opt/domli && docker-compose logs -f"
    echo "   Stop app: cd /opt/domli && docker-compose down"
    echo "   Restart: cd /opt/domli && docker-compose restart"
    echo "   Systemd: systemctl start/stop/status domli"
    echo ""
    echo "🔒 Security Notes:"
    echo "   - Change the JWT_SECRET in backend/.env"
    echo "   - Change the database password"
    echo "   - Configure SSL certificates for production"
    echo ""
    print_warning "Don't forget to log out and log back in for Docker group changes to take effect!"
}

# Main execution
main() {
    print_header "Domli Server Migration"
    
    check_root
    update_system
    install_docker
    install_docker_compose
    setup_firewall
    setup_app_directory
    clone_repository
    setup_environment
    start_application
    setup_database
    setup_systemd_service
    show_final_status
    
    print_status "Migration completed successfully! 🎉"
}

# Run main function
main 