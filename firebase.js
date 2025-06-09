// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD1HpQF9FbWKsnZzYT8jpIoZXtTS8y72D8",
  authDomain: "login-example-2ee43.firebaseapp.com",
  projectId: "login-example-2ee43",
  storageBucket: "login-example-2ee43.appspot.com",
  messagingSenderId: "185903382168",
  appId: "1:185903382168:web:5ae3e9ff7f4232b161daed"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);


export { auth };
export { storage };

