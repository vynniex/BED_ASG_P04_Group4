const { Time } = require("mssql");
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

const COLLECTION_NAME = "medications";

// Get all medicine
async function getAllMeds() {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
  } catch (error) {
    throw new Error(`Failed to retrieve medicines: ${error.message}`);
  }
}

// Get medicine by name
async function getMedByName(medicineName) {
    try {
        const docRef = doc(db, COLLECTION_NAME, medicineName);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        return {
            id: docSnap.id,
            ...docSnap.data()
        };
    } catch (error) {
        throw new Error(`Failed to retrieve medicine: ${error.message}`);
    }
}

// Create new medicine
async function createMed(medData) {
  try {
    if (!medData || !medData.medicineName) {
        throw new Error('Data for medicine is incomplete');
    }

    const medRef = doc(db, COLLECTION_NAME, medData.medicineName);

    // check for existing medicine record
    if ((await getDoc(medRef)).exists()) {
        throw new Error('Medication already exists');
    }

    const medication = {
        ...medData,
        createdAt: Timestamp.now()
    };

    await setDoc(medRef, medication);
    return {
        id: medData.medicineName,
        ...medication
    };
  } catch (error) {
    throw new Error(`Failed to create medicine: ${error.message}`);
  }
}

// Update medication
async function updateMed(medicineName, updates) {
  try {
    const medRef = doc(db, COLLECTION_NAME, medicineName);
    const docSnap = await getDoc(medRef);

    if (!docSnap.exists()) {
        throw new Error('Medicine not found');
    }

    const updatedData = {
        ...updates,
        updatedAt: Timestamp.now()
    };

    await updateDoc(medRef, updatedData);
    return {
        id: medicineName,
        ...updatedData
    };
  } catch (error) {
    throw new Error(`Failed to update medicine: ${error.message}`);
  }
}

// Delete medicine record
async function deleteMed(medicineName) {
  try {
    const medRef = doc(db, COLLECTION_NAME, medicineName);
    const docSnap = await getDoc(medRef);

    if (!docSnap.exists()) {
        throw new Error('Medicine not found');
    }

    await deleteDoc(medRef);
    return medicineName;
  } catch (error) {
    throw new Error(`Failed to delete medicine: ${error.message}`)
  }
}

module.exports = {
  getAllMeds,
  getMedByName,
  createMed,
  updateMed,
  deleteMed
};