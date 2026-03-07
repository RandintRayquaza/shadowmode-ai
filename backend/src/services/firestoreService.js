import { getDb } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "analyses";

export async function saveAnalysis(data) {
  const db = getDb();
  const ref = await db.collection(COLLECTION).add({
    ...data,
    timestamp: FieldValue.serverTimestamp(),
  });
  console.log(`[Firestore] Saved analysis ${ref.id} for user ${data.userId}`);
  return ref.id;
}

export async function updateAnalysis(id, data) {
  const db = getDb();
  await db.collection(COLLECTION).doc(id).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Get analysis history scoped strictly to the given userId.
 * Never returns results from other users.
 */
export async function getHistory(userId, limit = 20) {
  if (!userId) throw new Error("getHistory: userId is required");
  const db = getDb();
  console.log(`[Firestore] getHistory — userId: ${userId}, limit: ${limit}`);
  const snap = await db
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .limit(limit)
    .get();

  const history = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
  // In-memory sort to avoid requiring a composite index for (userId, timestamp)
  return history.sort((a, b) => {
    const tA = a.timestamp?.seconds || 0;
    const tB = b.timestamp?.seconds || 0;
    return tB - tA;
  });
}

/**
 * Get a single analysis result by ID, verifying ownership.
 * Returns null if not found OR if the record belongs to a different user.
 */
export async function getResultById(id, userId) {
  const db = getDb();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;

  const data = { id: doc.id, ...doc.data() };

  // Ownership check — never expose another user's record
  if (userId && data.userId && data.userId !== userId) {
    console.warn(`[Firestore] Ownership mismatch! Record ${id} belongs to ${data.userId}, requester is ${userId}`);
    return "forbidden";
  }

  return data;
}
