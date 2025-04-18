import mongoose from "mongoose";

// Connection retry settings
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;
let retryCount = 0;

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB Compass...");
    
    // MongoDB Compass connection string - using localhost with default port
    const MONGODB_URI = "mongodb://127.0.0.1:27017/Vishwaniketan-campus";
    
    console.log("MongoDB URI:", MONGODB_URI.replace(/mongodb:\/\/([^:]+)/, "mongodb://******")); // Safe logging

    mongoose.set('debug', true); // Enable mongoose debug mode

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    console.log(`Connection state: ${conn.connection.readyState}`);
    retryCount = 0; // Reset retry count on successful connection

    // Test the connection with a simple query
    const collections = await conn.connection.db.listCollections().toArray();
    console.log("Available collections:", collections.map(c => c.name));

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      reconnect();
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      reconnect();
    });

    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));
    reconnect();
    throw error; // Re-throw to be handled by caller
  }
};

// Reconnection function
const reconnect = () => {
  if (retryCount < MAX_RETRIES) {
    retryCount++;
    console.log(`Retrying connection... Attempt ${retryCount} of ${MAX_RETRIES}`);
    setTimeout(connectDB, RETRY_INTERVAL);
  } else {
    console.error('Failed to connect to MongoDB after maximum retries');
    process.exit(1);
  }
};

export default connectDB;

