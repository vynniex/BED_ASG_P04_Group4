const { db } = require("../../config/firebase");  // Import Firebase db instance
const { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs
 } = require("firebase/firestore");

// Get all medicines
async function getAllMeds(req, res) {
  try {
    const snapshot = await getDocs(collection(db, "medications"));
    const medications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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
    const docSnapshot = await getDoc(doc(db, "medications", medName));

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
    const { medName } = req.body;
    const medRef = doc(db, "medications", medName);

    if ((await getDoc(medRef)).exists()) {
      return res.status(400).json({
        success: false,
        message: "Medicine already exists",
      });
    }
  
    await setDoc(medRef, {
      ...req.body,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      data: req.body
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Could not create medicine"
    })
  }
}

// Delete medicine by name
async function deleteMed(req, res) {
  try {
    const medName = req.params.medName;
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
    const medRef = doc(db, "medications", medName);
    const docSnapshot = await getDoc(medRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ 
        success: false,
        error: "Medicine not found" });
    }

    const updatedData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(medRef, updatedData);
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