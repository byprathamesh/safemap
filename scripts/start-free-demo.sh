#!/bin/bash

echo "🛡️  SafeMap Production Demo Launcher"
echo "====================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo ""

# Start backend
echo "🔗 Starting Backend..."
cd backend
if [ ! -f ".env" ]; then
    echo "Creating backend environment file..."
    cat > .env << EOL
DATABASE_URL=file:./dev.db
JWT_SECRET=demo_secret_key_for_testing_only
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=3000
EOL
fi

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Setup database if not exists
if [ ! -f "dev.db" ]; then
    echo "Setting up database..."
    npx prisma migrate dev --name init
    npx prisma generate
fi

echo "Starting backend server..."
npm run dev &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait for backend to start
sleep 5

# Start dashboard
echo ""
echo "🖥️  Starting Dashboard..."
cd ../dashboard
if [ ! -f ".env.local" ]; then
    echo "Creating dashboard environment file..."
    cat > .env.local << EOL
REACT_APP_API_URL=http://localhost:3000
REACT_APP_SOCKET_URL=http://localhost:3000
EOL
fi

if [ ! -d "node_modules" ]; then
    echo "Installing dashboard dependencies..."
    npm install
fi

echo "Starting dashboard..."
npm run dev &
DASHBOARD_PID=$!
echo "✅ Dashboard started (PID: $DASHBOARD_PID)"

echo ""
echo "🎉 SafeMap Production Demo is now running!"
echo "========================================="
echo ""
echo "🖥️  Dashboard (Admin):    http://localhost:3001"  
echo "🔗 Backend API:          http://localhost:3000"
echo ""
echo "🌐 For Web App (Users):"
echo "📱 Web Prototype Repository: https://github.com/byprathamesh/safemapprototye.git"
echo "   Clone and run: git clone https://github.com/byprathamesh/safemapprototye.git"
echo "                  cd safemapprototye && npm install && npm run dev"
echo ""
echo "🧪 Test Emergency Flow:"
echo "1. Open Dashboard: http://localhost:3001"
echo "2. Deploy web prototype separately for user interface"
echo "3. Watch emergency monitoring in dashboard"
echo ""
echo "⚡ Features Available:"
echo "• Backend API for emergency processing"
echo "• Real-time dashboard monitoring"
echo "• Emergency response coordination"
echo "• Database with emergency logs"
echo "• Indian carrier integration ready"
echo ""
echo "🔧 To stop all services:"
echo "kill $BACKEND_PID $DASHBOARD_PID"
echo ""
echo "📚 Deployment Guide: See FREE-DEPLOYMENT.md"
echo "🌍 Deploy dashboard to Netlify, backend to Railway"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping SafeMap services..."
    kill $BACKEND_PID 2>/dev/null
    kill $DASHBOARD_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT

# Keep script running
while true; do
    sleep 1
done 