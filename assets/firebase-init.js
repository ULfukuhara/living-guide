import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDneH08GavPizbtH4Oi-RsTrwGerxXWSyQ",
  authDomain: "univlife-kanri.firebaseapp.com",
  projectId: "univlife-kanri",
  storageBucket: "univlife-kanri.firebasestorage.app",
  messagingSenderId: "405011982427",
  appId: "1:405011982427:web:cf56a37550ab714bfdb77e",
  measurementId: "G-DXMR0VL972"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
