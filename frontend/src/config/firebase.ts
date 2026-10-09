import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBALo_PSF-JMzVCx0q6O1zb_i_j4Ptx6q8",
  authDomain: "wastecut.firebaseapp.com",
  projectId: "wastecut",
  storageBucket: "wastecut.firebasestorage.app",
  messagingSenderId: "1055343974152",
  appId: "1:1055343974152:web:cf934714ed14f5c668febd",
  measurementId: "G-M36L855GBR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
