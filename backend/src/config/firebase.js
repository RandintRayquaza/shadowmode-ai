import admin from "firebase-admin";
import { createRequire } from "module";

let db;

function initFirebase() {
  if (admin.apps.length > 0) return;

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey      = process.env.FIREBASE_PRIVATE_KEY;

  if (clientEmail && rawKey && rawKey.includes("BEGIN PRIVATE KEY")) {
    // Replace literal \n with actual newlines (common env-var formatting issue)
    const privateKey = rawKey.replace(/\\n/g, "\n");

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("🔥 Firebase Admin initialised with service account.");
  } else {
    // Fallback: Application Default Credentials (works in Cloud Run / GCE)
    admin.initializeApp({ projectId });
    console.warn("⚠️  Firebase Admin using ADC (no service account found in env).");
  }

  db = admin.firestore();
}

initFirebase();

export function getDb() {
  if (!db) db = admin.firestore();
  return db;
}

export default admin;
