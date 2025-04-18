# Vishwaniketan Campus Portal

A comprehensive campus portal for Vishwaniketan Institute of Technology, providing a unified platform for students, faculty, and administrators.

## Features

- **Campus News Feed**: Post and view campus announcements, events, and updates
- **Notice Board**: Important notices for students and faculty
- **Multi-role support**: Different access levels for students, faculty, and admins
- **Department-specific content**: Targeted information for different departments
- **Profile Management**: View and edit user profiles
- **Discussion Forums**: Academic and non-academic discussions
- **Responsive Design**: Works on desktops, tablets, and mobile devices

## Technology Stack

### Frontend
- React 18+
- React Router for navigation
- Tailwind CSS for styling
- Axios for API communication

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Multer for file uploads

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)

### Client Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The client should be available at http://localhost:5173

### Server Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Update MongoDB URI and JWT secret as needed.

4. Start the server:
   ```bash
   npm start
   ```
   The server runs on http://localhost:5000 by default.

## Development

### Running in Development Mode
- Client: `npm run dev` in the client directory
- Server: `npm run dev` in the server directory (uses nodemon for auto-reload)

### Default Login Credentials
For development purposes, you can use these credentials:
- Username: `dev`
- Password: `dev123`

## Troubleshooting

### Common Issues
1. **MongoDB connection error**: Ensure MongoDB is running and the connection string is correct
2. **API calls failing**: Check that the client and server are both running and CORS is configured correctly
3. **Image uploads not working**: Verify that the uploads directory exists and has write permissions
4. **Authentication issues**: Ensure your JWT_SECRET is set and not exposed publicly

## License

This project is proprietary software for Vishwaniketan Institute of Technology.

```
project/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.js
├── server/
│   ├── config/
│   └── db.js
├── models/
│   ├── User.js
│   └── Post.js
├── routes/
│   ├── auth.js
│   ├── posts.js
│   ├── notices.js
│   ├── users.js
│   └── comments.js
├── uploads/
└── server.js
```

## Backend Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Frontend Setup

1. Navigate to client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:3000

## API Endpoints

- `/api/auth` - Authentication routes
- `/api/posts` - Post management
- `/api/notices` - Notice board
- `/api/users` - User management
- `/api/comments` - Comment system
- `/api/health` - Server health check

## File Upload

The application supports file uploads, stored in the `/uploads` directory. Files are served with appropriate CORS headers for cross-origin access.

## Error Handling

- Global error handler for catching unexpected errors
- 404 handler for undefined routes
- Unhandled promise rejection catching
- Detailed error logging in development mode

## Frontend Features

- Responsive dashboard
- Real-time form validation
- Rich text editor for posts
- Image upload with preview
- Infinite scroll for posts
- User profile management
- Dark/Light theme toggle
- Toast notifications
- Protected routes
- Session management


