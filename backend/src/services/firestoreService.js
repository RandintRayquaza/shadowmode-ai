import { getDb } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "analyses";

/**
 * Save a complete analysis record to Firestore
 * @param {Object} data - full analysis payload
 * @returns {Promise<string>} - the created document ID
 */
export async function saveAnalysis(data) {
  const db = getDb();
  const ref = await db.collection(COLLECTION).add({
    ...data,
    timestamp: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

/**
 * Get the most recent analyses
 * @param {number} [limit=20]
 * @returns {Promise<Array>}
 */
export async function getHistory(limit = 20) {
  const db = getDb();
  const snap = await db
    .collection(COLLECTION)
    .orderBy("timestamp", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get a single analysis record by Firestore document ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getResultById(id) {
  const db = getDb();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}
