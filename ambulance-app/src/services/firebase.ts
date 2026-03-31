import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string || 'AIzaSyDummyKeyForHackathonDemo',
  databaseURL: import.meta.env.VITE_FIREBASE_DB_URL as string || 'https://green-corridor-default-rtdb.firebaseio.com',
  projectId: 'green-corridor-demo',
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
