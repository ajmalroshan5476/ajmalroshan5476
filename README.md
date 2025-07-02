# Creator Collaboration Platform

A comprehensive collaboration platform designed specifically for video editors, content creators, and YouTubers to work together seamlessly on creative projects.

## Features

### 🎥 **Role-Based Collaboration**
- **Video Editors**: Professional editing tools and workspace management
- **Content Creators**: Cross-platform content planning and creation
- **YouTubers**: Channel management and direct upload capabilities

### 💬 **Real-Time Communication**
- Instant messaging with Socket.io
- File sharing and media preview
- Message reactions and replies
- User presence indicators

### 📁 **File Management**
- Drag-and-drop file uploads
- Support for videos, images, audio, and documents
- Organized file storage by project rooms
- File versioning and access control

### 🚀 **YouTube Integration**
- Direct video upload to YouTube
- Channel management
- OAuth2 authentication
- Upload quota tracking

### 🏠 **Room Management**
- Create public or private collaboration rooms
- Role-based permissions (admin, moderator, member)
- Project timeline and deadline tracking
- Member management and invitations

### 🔐 **Security & Privacy**
- JWT-based authentication
- Role-based access control
- File encryption and secure storage
- Rate limiting and security headers

## Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Multer** for file uploads
- **Google APIs** for YouTube integration
- **bcryptjs** for password hashing

### Frontend
- **React 18** with functional components and hooks
- **Material-UI (MUI)** for modern UI components
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io Client** for real-time features
- **React Query** for data fetching and caching
- **Zustand** for state management

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- YouTube Data API credentials (for YouTube integration)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd creator-collaboration-platform
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

#### Server Configuration
Create `server/.env` file:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/creator-platform

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# YouTube API Configuration
YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-client-secret
YOUTUBE_REDIRECT_URI=http://localhost:5000/api/youtube/callback
```

#### Client Configuration
Create `client/.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
```

### 4. YouTube API Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/youtube/callback`
6. Copy Client ID and Client Secret to your `.env` file

### 5. Database Setup
If using local MongoDB:
```bash
# Start MongoDB service
mongod

# The application will automatically create the database and collections
```

For MongoDB Atlas:
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Get your connection string
3. Replace the `MONGODB_URI` in your `.env` file

### 6. Start the Application
```bash
# From the root directory, start both server and client
npm run dev

# Or start individually:
# Server only
npm run server

# Client only
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage Guide

### Getting Started
1. **Register**: Create an account by selecting your role (Video Editor, Content Creator, or YouTuber)
2. **Complete Profile**: Fill in your specialties, experience level, and other details
3. **Create or Join Rooms**: Start collaborating by creating a new room or joining existing ones
4. **Upload Files**: Share your work by uploading videos, images, and other files
5. **Communicate**: Use the real-time chat to coordinate with your team

### Demo Accounts
For testing purposes, you can use these demo accounts:
- **Video Editor**: `editor@demo.com` / `password123`
- **Content Creator**: `creator@demo.com` / `password123`
- **YouTuber**: `youtuber@demo.com` / `password123`

### YouTube Integration
1. Connect your YouTube account in profile settings
2. Upload videos directly from room file sharing
3. Manage upload permissions and privacy settings
4. Track upload quota and channel statistics

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/verify` - Verify JWT token

### Room Endpoints
- `POST /api/rooms/create` - Create new room
- `GET /api/rooms/my-rooms` - Get user's rooms
- `GET /api/rooms/:roomId` - Get room details
- `POST /api/rooms/:roomId/join` - Join room
- `POST /api/rooms/:roomId/leave` - Leave room
- `PUT /api/rooms/:roomId/settings` - Update room settings

### File Upload Endpoints
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/upload/room/:roomId/files` - Get room files
- `DELETE /api/upload/file/:roomId/:filename` - Delete file

### YouTube Integration Endpoints
- `GET /api/youtube/auth` - Get YouTube authorization URL
- `GET /api/youtube/callback` - OAuth callback
- `POST /api/youtube/upload` - Upload video to YouTube
- `GET /api/youtube/channel` - Get channel info
- `GET /api/youtube/videos` - Get user's videos

### Message Endpoints
- `GET /api/messages/room/:roomId` - Get room messages
- `POST /api/messages/send` - Send message
- `PUT /api/messages/:messageId` - Edit message
- `DELETE /api/messages/:messageId` - Delete message
- `POST /api/messages/:messageId/reaction` - Add reaction

## Project Structure

```
creator-collaboration-platform/
├── server/                     # Backend server
│   ├── models/                # Database models
│   │   ├── User.js
│   │   ├── Room.js
│   │   └── Message.js
│   ├── routes/                # API routes
│   │   ├── auth.js
│   │   ├── rooms.js
│   │   ├── upload.js
│   │   ├── youtube.js
│   │   └── messages.js
│   ├── middleware/            # Custom middleware
│   │   └── auth.js
│   ├── uploads/               # File storage
│   ├── index.js               # Server entry point
│   └── package.json
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   └── Navbar.js
│   │   ├── contexts/          # React contexts
│   │   │   ├── AuthContext.js
│   │   │   └── SocketContext.js
│   │   ├── pages/             # Page components
│   │   │   ├── HomePage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── RoomPage.js
│   │   │   ├── ProfilePage.js
│   │   │   ├── CreateRoomPage.js
│   │   │   └── ExplorePage.js
│   │   ├── App.js             # Main app component
│   │   └── index.js           # React entry point
│   ├── public/
│   └── package.json
├── package.json               # Root package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@creatorhub.com or join our [Discord community](https://discord.gg/creatorhub).

## Roadmap

- [ ] Enhanced chat features (voice messages, video calls)
- [ ] Advanced file management (folders, tagging)
- [ ] Project templates and workflows
- [ ] Integration with other platforms (Twitch, TikTok)
- [ ] AI-powered content suggestions
- [ ] Mobile application
- [ ] Advanced analytics and reporting
- [ ] Plugin system for third-party integrations

---

Built with ❤️ for the creative community
