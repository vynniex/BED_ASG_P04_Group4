const { db } = require("../../config/firebase");  // Import Firebase db instance
const { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query,
  where
 } = require("firebase/firestore");

function validateMedInput(medData) {
  const { medName, purpose, perDay, foodTiming } = medData;
  if (!medName || !purpose || !perDay || !foodTiming) {
    throw new Error("All fields are required");
  }
  if (typeof perDay !== 'number' || perDay <= 0) {
    throw new Error("Frequency per day must be a positive number");
  }
}

// Get all medicines
async function getAllMeds(req, res) {
  try {
    const medsCollection = collection(db, "medications");
    const snapshot = await getDocs(medsCollection);
    
    const medications = [];
    snapshot.forEach(doc => {
      medications.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: medications
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error retrieving medicines" 
    });
  }
}

// Get medicine by name
async function getMedByName(req, res) {
  try {
    const medName = req.params.medName;

    if (!medName || typeof medName !== "string") {
      return res.status(400).json({ 
        success: false,
        error: "Invalid medicine name" 
      });
    }

    const medRef = doc(db, "medications", medName);
    const docSnapshot = await getDoc(medRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ 
        success: false,
        error: "Medicine not found" 
      });
    }

    res.json({ 
      success: true, 
      data: {
        id: docSnapshot.id,
        ...docSnapshot.data()
      }
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ 
      success: false,
      error: "Error retrieving medicine" 
    });
  }
}

// Create new medicine record
async function createMed(req, res) {
  try {
    const medData = req.body;
    validateMedInput(medData);

    const medRef = doc(db, "medications", medData.medName);
    const docSnapshot = await getDoc(medRef);

    if (docSnapshot.exists()) {
      return res.status(404).json({ 
        success: false,
        error: "Medicine already exists" 
      });
    }

    await setDoc(medRef, {
      ...medData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      data: {
        id: medData.medName,
        ...medData
      }
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Error creating medicine" 
    });
  }
}

// Delete medicine by name
async function deleteMed(req, res) {
  try {
    const medName = req.params.medName;

    if (!medName || typeof medName !== "string") {
      return res.status(400).json({ 
        success: false,
        error: "Invalid medicine name" 
      });
    }

    const medRef = doc(db, "medications", medName);
    const docSnapshot = await getDoc(medRef);
    if (!docSnapshot.exists()) {
      return res.status(404).json({ 
        success: false,
        error: "Medicine not found" 
      });
    }

    await deleteDoc(medRef);

    res.status(200).json({
      success: true,
      message: "Medicine deleted successfully"
    })
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ 
      success: false,
      error: "Error deleting medicine" 
    });
  }
}

// Update medicine by name (PUT)
async function updateMed(req, res) {
  try{ 
    const medName = req.params.medName;
    const updates = req.body;

    if (!medName || typeof medName !== "string") {
      return res.status(400).json({ 
        success: false,
        error: "Invalid medicine name" 
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "No update data provided" 
      });
    }

    const medRef = doc(db, "medications", medName);
    const docSnapshot = await getDoc(medRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ 
        success: false,
        error: "Medicine not found" });
    }
    
    // Prevent changing medName (doc ID)
    if (updates.medName && updates.medName !== medName) {
      return res.status(400).json({
        success: false,
        error: "Cannot change medication name - delete and create a new record"
      });
    }

    await updateDoc(medRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    // Get update
    const updatedDoc = await getDoc(medRef);

    res.json({
      success: true,
      message: "Medicine updated successfully",
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Error updating medicine" });
  }
}

module.exports = {
  createMed,
  getAllMeds,
  getMedByName,
  updateMed,
  deleteMed
};