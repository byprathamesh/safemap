#!/bin/bash

# SafeMap Development Environment Setup Script
# Run this to set up your local development environment quickly

set -e

echo "🚀 Setting up SafeMap Development Environment"
echo "============================================="

# Check prerequisites
check_prereq() {
    echo "📋 Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v flutter &> /dev/null; then
        echo "⚠️ Flutter is not installed. Mobile development will not be available."
        echo "Install Flutter from: https://flutter.dev/docs/get-started/install"
    fi
    
    echo "✅ Prerequisites check completed"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    # Root dependencies
    echo "Installing root dependencies..."
    npm install
    
    # Backend dependencies
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Dashboard dependencies
    echo "Installing dashboard dependencies..."
    cd dashboard
    npm install
    cd ..
    
    # Mobile dependencies (if Flutter is available)
    if command -v flutter &> /dev/null; then
        echo "Installing mobile dependencies..."
        cd mobile
        flutter pub get
        cd ..
    fi
    
    echo "✅ Dependencies installed"
}

# Setup environment
setup_environment() {
    echo "🔧 Setting up environment..."
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        cp env.example .env
        echo "📄 Created .env file from env.example"
        echo "⚠️  Please edit .env file with your actual API keys!"
    fi
    
    # Generate development keys
    if command -v openssl &> /dev/null; then
        echo "🔐 Generating development keys..."
        JWT_SECRET=$(openssl rand -base64 32)
        ENCRYPTION_KEY=$(openssl rand -base64 32)
        
        # Update .env file with generated keys
        sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        sed -i "s/^ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
        echo "✅ Generated JWT and encryption keys"
    fi
    
    echo "✅ Environment setup completed"
}

# Setup databases with Docker
setup_databases() {
    echo "🗄️ Setting up development databases..."
    
    # Start Docker Compose services
    if [ -f docker-compose.yml ]; then
        echo "Starting PostgreSQL, Redis, and MongoDB..."
        docker-compose up -d postgres redis mongodb
        
        # Wait for databases to be ready
        echo "⏳ Waiting for databases to be ready..."
        sleep 10
        
        # Run database migrations
        echo "🔄 Running database migrations..."
        cd backend
        npx prisma generate
        npx prisma migrate dev --name init
        cd ..
        
        echo "✅ Databases setup completed"
    else
        echo "❌ docker-compose.yml not found. Please ensure it exists."
        exit 1
    fi
}

# Build project
build_project() {
    echo "🔨 Building project..."
    
    # Build backend
    echo "Building backend..."
    cd backend
    npm run build
    cd ..
    
    # Build dashboard
    echo "Building dashboard..."
    cd dashboard
    npm run build
    cd ..
    
    echo "✅ Project built successfully"
}

# Run tests
run_tests() {
    echo "🧪 Running tests..."
    
    # Backend tests
    echo "Running backend tests..."
    cd backend
    npm test
    cd ..
    
    # Mobile tests (if Flutter available)
    if command -v flutter &> /dev/null; then
        echo "Running mobile tests..."
        cd mobile
        flutter test
        cd ..
    fi
    
    echo "✅ Tests completed"
}

# Start development servers
start_dev_servers() {
    echo "🚀 Starting development servers..."
    
    echo "Starting backend server on http://localhost:3000"
    echo "Starting dashboard on http://localhost:3001"
    echo "Starting mobile app (use 'flutter run' in mobile/ directory)"
    echo ""
    echo "To stop all services: Ctrl+C, then run 'docker-compose down'"
    echo ""
    
    # Start all services in development mode
    npm run dev
}

# Main execution
main() {
    echo "Starting SafeMap development setup..."
    echo ""
    
    check_prereq
    install_dependencies
    setup_environment
    setup_databases
    build_project
    
    # Ask if user wants to run tests
    read -p "🧪 Run tests? (y/N): " run_tests_choice
    if [[ $run_tests_choice =~ ^[Yy]$ ]]; then
        run_tests
    fi
    
    echo ""
    echo "🎉 SafeMap development environment is ready!"
    echo ""
    echo "📖 Quick commands:"
    echo "  npm run dev          - Start all development servers"
    echo "  npm run test         - Run all tests"
    echo "  npm run build        - Build all projects"
    echo "  npm run simulate:emergency - Test emergency system"
    echo ""
    echo "📱 Mobile development:"
    echo "  cd mobile && flutter run - Start mobile app"
    echo ""
    echo "🌐 URLs:"
    echo "  Backend API:    http://localhost:3000"
    echo "  Dashboard:      http://localhost:3001"
    echo "  Database Admin: http://localhost:5555 (Prisma Studio)"
    echo ""
    
    # Ask if user wants to start dev servers immediately
    read -p "🚀 Start development servers now? (Y/n): " start_choice
    if [[ ! $start_choice =~ ^[Nn]$ ]]; then
        start_dev_servers
    fi
}

# Run main function
main "$@" 