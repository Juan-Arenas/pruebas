import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBPJ0A3DS-zVDYw7BZKNHSQRsdFJOu7iLU",
  authDomain: "hermida-cadfd.firebaseapp.com",
  projectId: "hermida-cadfd",
  storageBucket: "hermida-cadfd.firebasestorage.app",
  messagingSenderId: "523186777778",
  appId: "1:523186777778:web:dc78c379cc18683f57e3ab",
  measurementId: "G-93FBVBQVLL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
