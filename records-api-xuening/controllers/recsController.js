const recsModel = require("../models/recsModel");

// Get all records
async function getAllRecords(req, res) {
  try {
    const records = await recsModel.getAllRecords();
    res.json(records);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving records" });
  }
}

// Create new or update existing record
async function createRecord(req, res) {
  try {
    const newRecord = await recsModel.createOrUpdateRecord(req.body);
    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating record" });
  }
}

// Update existing record by ID 
async function updateRecordById(req, res) {
  try {
    const id = parseInt(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "Invalid record ID" });
    }

    const updatedRecord = await recsModel.updateRecordById(id, req.body);
    if (!updatedRecord) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.status(200).json(updatedRecord);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error updating record" });
  }
}

// Delete record by ID
async function deleteRecordById(req, res) {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Invalid record ID" });
    }

    const result = await recsModel.deleteRecordById(id);
    if (result === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting record" });
  }
}

module.exports = {
  getAllRecords,
  createRecord,
  updateRecordById, 
  deleteRecordById,
};