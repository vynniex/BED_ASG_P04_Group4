// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

// Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdIA-5d3nFsd7meva1YUvQWSc3O2qgqo0",
  authDomain: "bed-asg-840eb.firebaseapp.com",
  projectId: "bed-asg-840eb",
  storageBucket: "bed-asg-840eb.firebasestorage.app",
  messagingSenderId: "970606110731",
  appId: "1:970606110731:web:60e1534b88e0c37689ff0e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db };