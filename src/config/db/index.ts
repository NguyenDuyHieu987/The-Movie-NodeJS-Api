import mongoose from 'mongoose';

export async function connect() {
  try {
    const URL = process.env.MONGODB_URI;

    await mongoose.connect(URL!, {
      dbName: 'Phimhay247_DB',
    });
    console.log('Connected to MongoDB');
  } catch (err: any) {
    console.log('Connected failed', err.message);
  }
}
