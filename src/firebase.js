import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  deleteUser,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  writeBatch,
  doc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  where,
  query,
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDycDzG5HeiY8d0ja6srRPAcgVOFryzdhI",
  authDomain: "derby-matching-system.firebaseapp.com",
  projectId: "derby-matching-system",
  storageBucket: "derby-matching-system.firebasestorage.app",
  messagingSenderId: "749132696358",
  appId: "1:749132696358:web:6e8f96286e438b00998fe7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  addDoc,
  getDoc,
  getDocs,
  signOut,
  doc,
  deleteDoc,
  onSnapshot,
  setDoc,
  writeBatch,
  deleteUser,
  where,
  updateDoc,
  onAuthStateChanged,
  query,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
};
