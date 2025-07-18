import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import dotenv from 'dotenv';

dotenv.config();

const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
const databaseURL = process.env.FIREBASE_DATABASE_URL;

if (!base64ServiceAccount || !databaseURL) {
  throw new Error('Firebase service account or database URL not found in .env');
}

const serviceAccount = JSON.parse(Buffer.from(base64ServiceAccount, 'base64').toString('utf8'));

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: databaseURL,
});

export const db = getDatabase();
