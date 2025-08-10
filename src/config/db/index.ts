import mongoose, { Error } from 'mongoose';

class MongoDB {
  constructor() {}

  async connect() {
    try {
      mongoose.set('strictQuery', false);

      const mongo_uri: string =
        process.env.NODE_ENV == 'production'
          ? process.env.MONGODB_URI!
          : process.env.MONGODB_URI_DEV!;

      console.log(process.env.NODE_ENV);

      await mongoose.connect(mongo_uri, {
        dbName: 'Phimhay247_DB_NEW_V2'
      });

      // mongoose.set('debug', true);

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

export default new MongoDB();
