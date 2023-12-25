import mongoose, { Error } from 'mongoose';
// import { isProduction } from 'std-env';

class MongoDB {
  constructor() {}

  async connect() {
    try {
      mongoose.set('strictQuery', false);

      const mongo_uri: string =
        process.env.NODE_ENV == 'production'
          ? process.env.MONGODB_URI!
          : 'mongodb://127.0.0.1:27017/Phimhay247_DB';

      console.log(process.env.NODE_ENV);

      await mongoose.connect(mongo_uri, {
        dbName: 'Phimhay247_DB'
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

export default new MongoDB();
