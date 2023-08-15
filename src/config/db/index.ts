import mongoose from 'mongoose';

class db {
  async connect() {
    try {
      mongoose.set('strictQuery', false);

      await mongoose.connect(process.env.MONGODB_URI!, {
        dbName: 'Phimhay247_DB',
      });

      // console.log('Connected to MongoDB');
    } catch (err: any) {
      console.log('Connect to database failed', err.message);
    }
  }
}

export default new db();
