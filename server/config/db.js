import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('ℹ️ No MONGODB_URI provided in .env. Running with fast in-memory hybrid store for local development & testing.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection failed (${error.message}). Falling back to seamless in-memory store for offline development.`);
    isConnected = false;
    return false;
  }
}

export function getDBStatus() {
  return {
    connected: isConnected,
    mode: isConnected ? 'MongoDB Atlas' : 'In-Memory Mock Store',
  };
}
