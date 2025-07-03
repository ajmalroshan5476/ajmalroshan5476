#!/bin/bash

echo "🚀 Starting Creator Collaboration Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check if MongoDB is running (if using local MongoDB)
# if ! pgrep -x "mongod" > /dev/null; then
#     echo "⚠️  MongoDB is not running. Starting MongoDB..."
#     mongod --fork --logpath /var/log/mongodb.log
# fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo "⚠️  Server .env file not found. Creating from example..."
    cp server/.env.example server/.env
    echo "Please edit server/.env with your configuration before running the app."
fi

# Start the application
echo "🌟 Starting the application..."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

npm run dev