const recsModel = require("../models/recsModel");
const { isDuplicateDate } = require("../models/recsModel");

// GET all records from logged in user
async function getAllRecords(req, res) {
  const userId = req.user.id;  // Extract userId from verified JWT token

  try {
    // Fetch all records for this user from the model
    const records = await recsModel.getRecordsByUserId(userId);
    res.json(records);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving all records" });
  }
}

// GET a single record by recordId
async function getRecordById(req, res) {
  const userId = req.user.id;
  try {
    const id = parseInt(req.params.id);
    // Return 400 if recordId parameter in the URL is not a valid number
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid record ID" });
    }

    // Fetch the record from the database by recordId
    const record = await recsModel.getRecordById(id);
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Check if the record belongs to the logged-in user
    if (record.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Return the record data as JSON
    res.json(record);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving record" });
  }
}

// POST a new record for the logged-in user
async function createRecord(req, res) {
  const userId = req.user.id; 
  const data = req.body;

  // Validate request body exists
  if (!data) return res.status(400).json({ message: "Missing record data" });

  // Override userId in client data, prevent spoofing
  data.userId = userId; 

  try {
    const duplicate = await isDuplicateDate(userId, data.date);
    if (duplicate) {
      return res.status(400).json({ error: "A record for this date already exists." });
    }

    // Create the new record in the database
    const newRecord = await recsModel.createRecord(data);

    // Respond with the newly created record 
    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating record" });
  }
}

// UPDATE an existing record by recordId 
async function updateRecordById(req, res) {
  const userId = req.user.id;
  try {
    const id = parseInt(req.params.id);

    // Validate recordId is a positive integer
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid record ID" });
    }

    // Fetch existing record to check ownership and existence
    const existingRecord = await recsModel.getRecordById(id);
    if (!existingRecord) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Check if logged-in user owns this record
    if (existingRecord.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Override userId with logged-in user ID
    const data = req.body;
    data.userId = userId;

    // Check for duplicate date excluding the current record's own id
    const duplicate = await isDuplicateDate(req.body.userId, req.body.date, id);
    if (duplicate) {
      return res.status(400).json({ error: "Another record with this date already exists." });
    }

    // Update the record in the database
    const updatedRecord = await recsModel.updateRecordById(id, req.body);
    if (!updatedRecord) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Respond with the updated record
    res.status(200).json(updatedRecord);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error updating record" });
  }
}

// DELETE record by recordId
async function deleteRecordById(req, res) {
  const userId = req.user.id;
  try {
    const id = req.params.id;
    if (!id) {
      // Validate recordId parameter is present
      return res.status(400).json({ error: "Invalid record ID" });
    }

    // Fetch existing record to check ownership and existence
    const existingRecord = await recsModel.getRecordById(id);
    if (!existingRecord) return res.status(404).json({ error: "Record not found" });

    // Verify that the record belongs to logged-in user
    if (existingRecord.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Delete the record in the database
    const result = await recsModel.deleteRecordById(id);
    if (result === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Return success message
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