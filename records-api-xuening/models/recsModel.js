const { db } = require("../../config/firebase");
const {
  collection,
  getDocs,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
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

// Create or update a record
async function createOrUpdateRecord(recordData) {
  const dateStr = recordData.date;
  const docId = `${dateStr.replace(/-/g, "_")}_record`;

  const recordRef = doc(db, COLLECTION_NAME, docId);

  // Convert string date to Firestore Timestamp
  const timestampDate = Timestamp.fromDate(new Date(dateStr));

  const newRecord = {
    ...recordData,
    date: timestampDate // use timestamp instead of string
  };

  await setDoc(recordRef, newRecord);
  return { id: docId, ...newRecord };
}

// Update by document ID
async function updateRecordById(id, updatedData) {
  const recordRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(recordRef);

  if (!docSnap.exists()) return null;

  // if date changes, convert it
  if (updatedData.date) {
    updatedData.date = Timestamp.fromDate(new Date(updatedData.date));
  }

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