import dotenv from 'dotenv';
import path from 'path';
import { disconnectDatabase } from '../src/config';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

process.env.NODE_ENV = 'test';

afterAll(async () => {
  await disconnectDatabase();
});
