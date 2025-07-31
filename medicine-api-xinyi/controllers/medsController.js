const medsModel = require('../models/medsModel');

// Get all medicines for the logged-in user
async function getMedsByUserId(req, res) {
  try {
    const userId = req.user.id; // From verifyJWT middleware

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Missing or invalid user ID' });
    }

    const meds = await medsModel.getMedsByUserId(userId);
    res.json(meds);
  } catch (error) {
    console.error('Controller Error: ', error);
    res.status(500).json({ error: 'Error retrieving medicines for user' });
  }
}

// Get a single medicine by its ID
async function getMedById(req, res) {
  try {
    const medId = parseInt(req.params.medId, 10);
    if (isNaN(medId)) {
      return res.status(400).json({ error: 'Invalid medicine ID' });
    }

    const med = await medsModel.getMedById(medId);
    if (!med) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    // Security check: ensure the medicine belongs to the logged-in user
    if (med.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You don't have permission to access this resource." });
    }
    
    res.json(med);
  } catch (error) {
    console.error('Controller Error: ', error);
    res.status(500).json({ error: 'Error retrieving medicine' });
  }
}

// Create new medicine
async function createMed(req, res) {
  try {
    const medData = {
      userId: req.user.id, // from verifyJWT
      ...req.body
    };

    const newMed = await medsModel.createMed(medData);
    res.status(201).json(newMed);
  } catch (error) {
    console.error('Controller Error: ', error);
    // Use 409 Conflict for "already exists" errors
    const status = error.message.includes('already exists') || error.message.includes('already taken') ? 409 : 500;
    res.status(status).json({
      error: error.message || "Could not create medicine"
    });
  }
}

// Update medicine by its ID
async function updateMed(req, res) {
  try {
    const medId = parseInt(req.params.medId, 10);
    if (isNaN(medId)) {
      return res.status(400).json({ error: 'Invalid medicine ID' });
    }

    // Security check: First, get the medicine to ensure it belongs to the user
    const existingMed = await medsModel.getMedById(medId);
    if (!existingMed) {
        return res.status(404).json({ error: 'Medicine not found' });
    }
    if (existingMed.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You cannot edit this resource." });
    }

    // If authorized, proceed with the update
    const updated = await medsModel.updateMed(medId, req.body);
    res.json(updated);

  } catch (error) {
    console.error("Controller Error: ", error);
    const status = error.message.includes('already taken') ? 409 : 500;
    res.status(status).json({ 
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

    // Security check: Ensure the medicine belongs to the user before deleting
    const medToDelete = await medsModel.getMedById(medId);
    if (!medToDelete) {
        return res.status(404).json({ error: 'Medicine not found' });
    }
    if (medToDelete.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You don't have permission to delete this resource." });
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
  getMedsByUserId,
  getMedById,
  createMed,
  updateMed,
  deleteMedById
};