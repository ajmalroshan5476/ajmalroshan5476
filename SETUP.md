# Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites
- Node.js (v16+) - [Download here](https://nodejs.org/)
- MongoDB - [Local install](https://www.mongodb.com/docs/manual/installation/) or [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud)

### 2. One-Command Setup
```bash
# Clone and start (Linux/Mac)
git clone <your-repo-url>
cd creator-collaboration-platform
./start.sh
```

### 3. Manual Setup (Windows or if script fails)
```bash
# Install dependencies
npm run install-deps

# Copy environment file
cp server/.env.example server/.env

# Edit server/.env with your settings
# At minimum, set MONGODB_URI and JWT_SECRET

# Start both frontend and backend
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎯 Quick Test

1. Register a new account (choose any role)
2. Go to Dashboard
3. Create a test room
4. Explore the interface

## 🔧 Environment Variables

### Essential Settings (server/.env)
```env
# Database (required)
MONGODB_URI=mongodb://localhost:27017/creator-platform

# Security (required)
JWT_SECRET=your-random-secret-key-here

# Optional: YouTube Integration
YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-client-secret
```

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill processes on ports 3000 and 5000
npx kill-port 3000 5000
```

### MongoDB Connection Error
```bash
# Start local MongoDB
mongod
# Or use MongoDB Atlas connection string
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
rm -rf server/node_modules server/package-lock.json
rm -rf client/node_modules client/package-lock.json
npm run install-deps
```

## 📚 Next Steps

1. **Read the [README.md](README.md)** for full documentation
2. **Explore API endpoints** at http://localhost:5000/api
3. **Check the project structure** in README.md
4. **Set up YouTube integration** for full functionality

## 🤝 Development Workflow

```bash
# Development (auto-reload)
npm run dev

# Server only
npm run server

# Client only
npm run client

# Build for production
npm run build
```

---

Need help? Check the [README.md](README.md) or open an issue!