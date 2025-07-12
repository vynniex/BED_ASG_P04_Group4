const medsModel = require('../models/medsModel');

// Get all medicines
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

// Get medicine by name
async function getMedByName(req, res) {
  try {
    const medicineName = req.params.medName;

    if (!medicineName) {
      return res.status(400).json({ error: 'Medicine name is not recognised'})
    }

    const medication = await medsModel.getMedByName(medicineName);
    if (!medication) {
      return res.status(404).json({ error: 'Medicine not found'})
    }

    res.json(medication);
  } catch (error) {
    console.error('Controller Error: ', error)
    res.status(500).json({ 
      error: error.message || "Error retrieving medicine" 
    });
  }
}

// Create new medicine record
async function createMed(req, res) {
  try {
    const newMed = await medsModel.createMed(req.body);
    res.status(201).json(newMed);
  } catch (error) {
    console.error('Controller Error: ', error);
    const status = error.message.includes('exists') ? 400 : 500;
    res.status(status).json({
      error: error.message || "Could not create medicine"
    })
  }
}

// Update medicine by name (PUT)
async function updateMed(req, res) {
  try { 
    const medicineName = req.params.medName;

    if (!medicineName) {
      return res.status(400).json({ error: "Invalid medicine name"});
    }

    const updateMed = await medsModel.updateMed(medicineName, req.body);
    if (!updateMed) {
      return res.status(404).json({ error: 'Medicine not found'});
    }

    res.json(updateMed);
  } catch (error) {
    console.error("Controller Error: ", error);
    res.status(500).json({ 
      error: error.message || "Error updating medicine" 
    });
  }
}

// Delete medicine by name
async function deleteMed(req, res) {
  try {
    const medicineName = req.params.medName;
    if (!medicineName) {
      return res.status(400).json({ error: 'Invalid medicine name'});
    }

    await medsModel.deleteMed(medicineName);
    res.json({ message: 'Medicine successfully deleted'});
  } catch (error) {
    console.error('Controller Error: ', error);
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ 
      error: error.message || "Error deleting medicine" 
    });
  }
}

module.exports = {
  getAllMeds,
  getMedByName,
  createMed,
  updateMed,
  deleteMed
};