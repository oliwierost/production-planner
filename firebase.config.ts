import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyCwxoDPzfXr6IkCTHLpW5MCqlVRK3_tvfI",
  authDomain: "production-schedule-3033a.firebaseapp.com",
  projectId: "production-schedule-3033a",
  storageBucket: "production-schedule-3033a.appspot.com",
  messagingSenderId: "703552007051",
  appId: "1:703552007051:web:77030a657310d7c91e1d8e",
  measurementId: "G-2RYWZJN3MX",
};

const app = initializeApp(firebaseConfig);
export const firestore = getAnalytics(app);
