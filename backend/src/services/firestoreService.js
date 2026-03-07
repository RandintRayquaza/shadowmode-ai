import { getDb } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "analyses";

export async function saveAnalysis(data) {
  const db = getDb();
  const ref = await db.collection(COLLECTION).add({
    ...data,
    timestamp: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateAnalysis(id, data) {
  const db = getDb();
  await db.collection(COLLECTION).doc(id).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getHistory(limit = 20) {
  const db = getDb();
  const snap = await db
    .collection(COLLECTION)
    .orderBy("timestamp", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getResultById(id) {
  const db = getDb();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}
