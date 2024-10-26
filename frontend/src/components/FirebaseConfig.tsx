import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgioLi0UXJuDoUkYsFWbzuZtikTKreWVs",
  authDomain: "signbridge-a714f.firebaseapp.com",
  projectId: "signbridge-a714f",
  storageBucket: "signbridge-a714f.appspot.com",
  messagingSenderId: "273065782578",
  appId: "1:273065782578:web:7e173a0fc8a927174abb2b",
  measurementId: "G-GZMCRS9MC7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app; 