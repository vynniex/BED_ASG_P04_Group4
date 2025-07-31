const medsModel = require('../models/medsModel');

// Get all medicines (admin/dev use only)
async function getAllMeds(req, res) {
  try {
    const medications = await medsModel.getAllMeds();
    res.json(medications);
  } catch (error) {
    console.error('Controller Error: ', error);
    res.status(500).json({
      error: 'Error retrieving medicine records'
    });
  }
}

// Get medicines for a specific user by userId (from query)
async function getMedsByUserId(req, res) {
  try {
    const userId = req.user.id;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Missing or invalid userId' });
    }

    const meds = await medsModel.getMedsByUserId(userId);
    res.json(meds);
  } catch (error) {
    console.error('Controller Error: ', error);
    res.status(500).json({ error: 'Error retrieving medicines for user' });
  }
}

// Create new medicine
async function createMed(req, res) {
  try {
    const newMed = await medsModel.createMed(req.body);
    res.status(201).json(newMed);
  } catch (error) {
    console.error('Controller Error: ', error);
    const status = error.message.includes('already exists') ? 400 : 500;
    res.status(status).json({
      error: error.message || "Could not create medicine"
    });
  }
}

// Update medicine by name
async function updateMed(req, res) {
  try {
    const medicineName = req.params.medName;

    if (!medicineName) {
      return res.status(400).json({ error: "Invalid medicine name" });
    }

    const updated = await medsModel.updateMed(medicineName, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error("Controller Error: ", error);
    res.status(500).json({ 
      error: error.message || "Error updating medicine" 
    });
  }
}

// Delete medicine by ID
async function deleteMedById(req, res) {
  try {
    const medId = parseInt(req.params.medId, 10);
    if (isNaN(medId)) {
      return res.status(400).json({ error: 'Invalid medicine ID' });
    }

    await medsModel.deleteMedById(medId);
    res.json({ message: 'Medicine successfully deleted' });
  } catch (error) {
    console.error('Controller Error: ', error);
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: error.message || 'Error deleting medicine' });
  }
}

module.exports = {
  getAllMeds,
  getMedsByUserId,
  createMed,
  updateMed,
  deleteMedById
};