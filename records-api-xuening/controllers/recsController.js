const recsModel = require("../models/recsModel");
const { isDuplicateDate } = require("../models/recsModel");

// GET all records from logged in user
async function getAllRecords(req, res) {
  const userId = req.user.id;  // get userId from verified JWT
  try {
    const records = await recsModel.getRecordsByUserId(userId);
    res.json(records);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving all records" });
  }
}

// GET record by recordId
async function getRecordById(req, res) {
  const userId = req.user.id;
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid record ID" });
    }

    const record = await recsModel.getRecordById(id);
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Check if the record belongs to the logged-in user
    if (record.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(record);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving record" });
  }
}

// POST a new record
async function createRecord(req, res) {
  const userId = req.user.id;
  const data = req.body;
  if (!data) return res.status(400).json({ message: "Missing record data" });

  // Override client data
  data.userId = userId; 

  try {
    // Check for duplicate date for the user before creating
    const duplicate = await isDuplicateDate(userId, data.date);
    if (duplicate) {
      return res.status(400).json({ error: "A record for this date already exists." });
    }

    const newRecord = await recsModel.createRecord(data);
    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating record" });
  }
}

// UPDATE record by ID 
async function updateRecordById(req, res) {
  const userId = req.user.id;
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid record ID" });
    }

    const existingRecord = await recsModel.getRecordById(id);
    if (!existingRecord) {
      return res.status(404).json({ error: "Record not found" });
    }

    if (existingRecord.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Override userId with logged-in user ID
    const data = req.body;
    data.userId = userId;

    // Check for duplicate date excluding this record's own id
    const duplicate = await isDuplicateDate(req.body.userId, req.body.date, id);
    if (duplicate) {
      return res.status(400).json({ error: "Another record with this date already exists." });
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

// DELETE record by ID
async function deleteRecordById(req, res) {
  const userId = req.user.id;
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Invalid record ID" });
    }

    const existingRecord = await recsModel.getRecordById(id);
    if (!existingRecord) return res.status(404).json({ error: "Record not found" });

    if (existingRecord.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await recsModel.deleteRecordById(id);
    if (result === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting record" });
  }
}

module.exports = {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecordById, 
  deleteRecordById,
};