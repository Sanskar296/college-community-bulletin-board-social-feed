## Project Structure

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
   

# Vishwaniketan Campus Project


A web application for managing campus activities, posts, notices, and user interactions.

## Features

- User authentication and authorization
- User profiles with avatars
- Posts management system
- Notice board functionality
- Comments system
- File upload capabilities
- Cross-origin resource sharing enabled

## Technology Stack

### Frontend
- React.js
- Redux for state management
- Material-UI components
- Axios for API calls
- React Router for navigation
- Form validation with Formik & Yup
- Responsive design with CSS3/SCSS

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JSON Web Tokens for authentication

### Security Features
- CORS protection
- Environment variable configuration
- Static file serving with security headers
- Error handling middleware
- Input sanitization

## Project Structure

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


