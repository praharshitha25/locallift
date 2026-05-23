import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyASIv5ZM0YfY0RlTxJDeGrgQ682EwEAMhg",
  authDomain: "locallift-web.firebaseapp.com",
  projectId: "locallift-web",
  storageBucket: "locallift-web.firebasestorage.app",
  messagingSenderId: "994791725220",
  appId: "1:994791725220:web:6570efe72d8676233fee31",
  measurementId: "G-PHRPGM090S"
};

const app = initializeApp(firebaseConfig);

getAnalytics(app);

console.log("Firebase Connected");

export default app;