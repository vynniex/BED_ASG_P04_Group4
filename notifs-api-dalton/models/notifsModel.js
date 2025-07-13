const { db } = require('../../config/firebase'); // Adjust path to your firebase config
const {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} = require('firebase/firestore');

const notifsCollection = collection(db, 'notifications'); // Create a reference to the 'notifications' collection

// CREATE: Add a new notification to Firestore
const addNotif = async (notifData) => {
  const docRef = await addDoc(notifsCollection, notifData);
  return { id: docRef.id, ...notifData };
};

// READ: Get all notifications from Firestore
const getAllNotifs = async () => {
  const snapshot = await getDocs(notifsCollection);
  const notifs = [];
  snapshot.forEach(doc => {
    notifs.push({ id: doc.id, ...doc.data() });
  });
  return notifs;
};

// UPDATE: Update a notification in Firestore by its ID
const updateNotifById = async (id, data) => {
  const notifDoc = doc(db, 'notifications', id);
  await updateDoc(notifDoc, data);
  const updatedDoc = await getDoc(notifDoc);
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

// DELETE: Delete a notification from Firestore by its ID
const deleteNotifById = async (id) => {
  const notifDoc = doc(db, 'notifications', id);
  await deleteDoc(notifDoc);
};

module.exports = {
  addNotif,
  getAllNotifs,
  updateNotifById,
  deleteNotifById,
};