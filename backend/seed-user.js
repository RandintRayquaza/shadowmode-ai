/**
 * seed-user.js
 * Run once to create a dummy test user in Firebase Auth + Firestore.
 *
 * Usage (from the backend folder):
 *   node seed-user.js
 */

import "dotenv/config";
import admin from "./src/config/firebase.js";
import { getDb } from "./src/config/firebase.js";

const DUMMY_USER = {
  email: "test@shadowmode.dev",
  password: "Test@1234",
  displayName: "Shadow Tester",
  emailVerified: true,
};

async function seedUser() {
  try {
    // Create in Firebase Auth
    const user = await admin.auth().createUser(DUMMY_USER);
    console.log("✅ Firebase Auth user created:");
    console.log("   UID:   ", user.uid);
    console.log("   Email: ", user.email);

    // Save to Firestore
    const db = getDb();
    await db.collection("users").doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      phone: null,
      photoURL: null,
      provider: "email",
      emailVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    });
    console.log("✅ User saved to Firestore collection: users");

    // Generate a custom token you can exchange for an idToken via REST
    const customToken = await admin.auth().createCustomToken(user.uid);
    console.log("\n🔑 Custom Token (use this to get an idToken for Postman):");
    console.log(customToken);
    console.log("\n📌 Exchange it for an idToken with:");
    console.log(`   POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyArb0_dlowLuEaUHv4AXjiCMBAAJAd_5Eo`);
    console.log(`   Body: { "token": "<custom_token>", "returnSecureToken": true }`);
    console.log(`   → Copy "idToken" from the response and use it in Postman.\n`);

  } catch (err) {
    if (err.code === "auth/email-already-exists") {
      console.log("⚠️  User already exists — fetching existing user instead.");
      const existing = await admin.auth().getUserByEmail(DUMMY_USER.email);
      const token = await admin.auth().createCustomToken(existing.uid);
      console.log("🔑 Custom Token for existing user:");
      console.log(token);
    } else {
      console.error("❌ Error:", err.message);
    }
  } finally {
    process.exit(0);
  }
}

seedUser();
