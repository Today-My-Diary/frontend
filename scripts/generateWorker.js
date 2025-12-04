import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const SW_PATH = path.resolve(__dirname, "../public/firebase-messaging-sw.js");

const swContent = `
/* [AUTO-GENERATED] 
  이 파일은 scripts/workerGenerator.js 에 의해 자동 생성되었습니다. 
  직접 수정하지 마세요. 
*/
importScripts('https://www.gstatic.com/firebasejs/11.3.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.3.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "${process.env.VITE_FIREBASE_API_KEY}",
  authDomain: "${process.env.VITE_FIREBASE_AUTH_DOMAIN}",
  projectId: "${process.env.VITE_FIREBASE_PROJECT_ID}",
  storageBucket: "${process.env.VITE_FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${process.env.VITE_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${process.env.VITE_FIREBASE_APP_ID}",
  measurementId: "${process.env.VITE_FIREBASE_MEASUREMENT_ID}",
};

if (firebaseConfig.apiKey && firebaseConfig.authDomain) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
} else {
  console.error("Firebase configuration is missing in the service worker.");
}
`;

try {
  fs.writeFileSync(SW_PATH, swContent, "utf8");
  console.log("public/firebase-messaging-sw.js generated successfully.");
} catch (error) {
  console.error("Failed to generate Service Worker:", error);
  process.exit(1);
}
