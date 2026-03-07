import admin from "firebase-admin";

function initFirebase() {
  if (admin.apps.length > 0) return;

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey      = process.env.FIREBASE_PRIVATE_KEY;

  if (clientEmail && rawKey?.includes("BEGIN PRIVATE KEY")) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: rawKey.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    admin.initializeApp({ projectId });
  }
}

initFirebase();

export function getDb() {
  return admin.firestore();
}

export default admin;
