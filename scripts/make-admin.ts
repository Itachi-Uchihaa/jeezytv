import * as dotenv from 'dotenv';
import * as path from 'path';
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";



if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

console.log('Project ID:', projectId);
console.log('Client Email:', clientEmail);
console.log('Private Key exists:', !!privateKey);

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase configuration. Please check your .env file.');
  process.exit(1);
}

// Initialize Firebase Admin
try {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

async function makeUserAdmin(uid: string) {
  try {
    await getAuth().setCustomUserClaims(uid, { admin: true });
    console.log('Admin rights granted successfully to:', uid);
  } catch (error) {
    console.error('Error granting admin rights:', error);
  }
}

// Your UID
const UID = "oklktKo5AfORwLL8jrYcjnUST2h2";
makeUserAdmin(UID).then(() => process.exit(0));