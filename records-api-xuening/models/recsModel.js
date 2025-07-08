const { db } = require("../../config/firebase");
const {
  collection,
  getDocs,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  doc
} = require("firebase/firestore");

const COLLECTION_NAME = "records";

// Get all records
async function getAllRecords() {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  const records = [];
  querySnapshot.forEach(doc => {
    records.push({ id: doc.id, ...doc.data() });
  });
  return records;
}

// Create or update a record (one per date)
async function createOrUpdateRecord(recordData) {
  const date = recordData.date.replace(/-/g, "_");
  const docId = `${date}_record`;

  const recordRef = doc(db, COLLECTION_NAME, docId);
  await setDoc(recordRef, recordData);
  return { id: docId, ...recordData };
}

// Update by document ID (optional use case)
async function updateRecordById(id, updatedData) {
  const recordRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(recordRef);

  if (!docSnap.exists()) return null;

  await updateDoc(recordRef, updatedData);
  return { id, ...updatedData };
}

// Delete record by document ID
async function deleteRecordById(id) {
  const recordRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(recordRef);
  if (!docSnap.exists()) return 0;

  await deleteDoc(recordRef);
  return 1;
}

module.exports = {
  getAllRecords,
  createOrUpdateRecord,
  updateRecordById,
  deleteRecordById,
};