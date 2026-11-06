import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(customUri) {
  // Use customUri if explicitly provided (e.g. from mongodb-memory-server in tests)
  const uri = customUri || (process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI);

  if (process.env.NODE_ENV !== 'test') {
    if (!process.env.MONGODB_URI) {
      throw new Error('FATAL: MONGODB_URI is not defined in environment.');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('FATAL: JWT_SECRET is not defined in environment.');
    }
  }

  if (!uri) {
    if (process.env.NODE_ENV === 'test') {
      return false;
    }
    throw new Error('FATAL: Database connection URI is missing.');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`✅ MongoDB Connected: ${conn.connection.host} (database: ${conn.connection.name})`);
    }
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`❌ MongoDB connection error: ${error.message}`);
    throw error;
  }
}

export async function disconnectDB() {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

export function getDBStatus() {
  const ready = mongoose.connection.readyState === 1;
  return {
    connected: ready,
    mode: ready ? 'MongoDB Atlas' : 'Disconnected',
  };
}
