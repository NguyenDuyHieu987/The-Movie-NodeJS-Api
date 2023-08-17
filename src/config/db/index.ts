import mongoose, { Error } from 'mongoose';

class db {
  async connect() {
    try {
      mongoose.set('strictQuery', false);

      await mongoose.connect(process.env.MONGODB_URI!, {
        dbName: 'Phimhay247_DB',
      });

      // console.log('Connected to MongoDB');
    } catch (err: any) {
      if (err instanceof Error) {
        console.error('Connect to database failed', err.message);
        return;
      }
      console.error('Connect to database failed', err);
    }
  }
}

export default new db();
