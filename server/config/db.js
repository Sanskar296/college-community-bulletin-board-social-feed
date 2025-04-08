import mongoose from "mongoose";

// Connection retry settings
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;
let retryCount = 0;

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("MongoDB URI:", process.env.MONGO_URI ? "URI exists" : "URI missing"); // Safe logging

    mongoose.set('debug', true); // Enable mongoose debug mode

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/Vishwaniketan-campus", {
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

