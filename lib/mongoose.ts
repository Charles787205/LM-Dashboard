import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Extend NodeJS.Global type to add a custom `mongoose` property
declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

// Prevent TypeScript from complaining about redeclaring `global`
const globalWithMongoose = global as typeof globalThis & {
  mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
};

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000, // 8 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      retryWrites: true, // Retry writes on failure
      retryReads: true, // Retry reads on failure
    };

    cached.promise = Promise.race([
      mongoose.connect(MONGODB_URI as string, opts),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('MongoDB connection timeout')), 10000)
      )
    ]);
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ MongoDB connected successfully');
    return cached.conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    cached.promise = null; // Reset promise on failure
    throw error;
  }
}

// Default export for convenience
export default connectToDatabase;
