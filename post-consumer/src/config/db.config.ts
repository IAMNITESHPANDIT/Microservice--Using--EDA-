import mongoose from 'mongoose';

export const connectDb = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://mongoadmin:secret@localhost:27017';

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
