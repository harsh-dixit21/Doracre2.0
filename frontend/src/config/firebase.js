import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'

// REPLACE with your real config from Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyDI6xHqHmBndk-c4dh01Zolo2ptTHYaMxY",
  authDomain: "doracare1-12409.firebaseapp.com",
  projectId: "doracare1-12409",
  storageBucket: "doracare1-12409.firebasestorage.app",
  messagingSenderId: "961545881193",
  appId: "1:961545881193:web:9db4ab487426e3ea85c4f8"
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
})

export {
  auth,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
}

export default app
