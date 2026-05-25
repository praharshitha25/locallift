import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyASIv5ZM0YfY0RlTxJDeGrgQ682EwEAMhg",
  authDomain: "locallift-web.firebaseapp.com",
  projectId: "locallift-web",
  storageBucket: "locallift-web.firebasestorage.app",
  messagingSenderId: "994791725220",
  appId: "1:994791725220:web:6570efe72d8676233fee31"
}

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app)
export const auth = getAuth(app)
export default app;