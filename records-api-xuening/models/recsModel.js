const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Check if a record already exists for the user on the same date
// Used to prevent duplicate entries for the same day
async function isDuplicateDate(userId, date, excludeRecordId = null) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    // Count number of records that exist for the user on that date
    let query = `SELECT COUNT(*) AS count FROM Records WHERE userId = @userId AND date = @date`;

    // If updating a record: exclude the record itself from the duplicate check
    if (excludeRecordId) {
      query += ` AND recordId != @excludeId`;
    }

    // Query parameters
    const request = connection.request();
    request.input("userId", sql.Int, userId);
    request.input("date", sql.Date, date);
    if (excludeRecordId) {
      request.input("excludeId", sql.Int, excludeRecordId);
    }

    const result = await request.query(query);

    // Return true if count > 0 (duplicate exists)
    return result.recordset[0].count > 0;

  } catch (error) {
    console.error("Database error:", error);
    throw error;

  } finally {
    if (connection) await connection.close();
  }
}

// GET all records 
// NOTE: function should be restricted by user in controller
async function getAllRecords() {
  let connection; 
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT * FROM Records`; 
    const request = connection.request();
    const result = await request.query(sqlQuery);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close(); 
      } catch (err) {
        console.error("Error closing database connection:", err);
      }
    }
  }
}

// GET record by userId
async function getRecordsByUserId(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `SELECT * FROM Records WHERE userId = @userId`;
    const request = connection.request();
    request.input("userId", sql.Int, userId);
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

// GET a single record by recordId
async function getRecordById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM Records WHERE recordId = @id";
    const request = connection.request();
    request.input("id", sql.Int, id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // Record not found
    }

    return result.recordset[0]; // Return the single record
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// POST a new record for a user
async function createRecord(data) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO Records 
        (userId, date, doctorName, diagnosis, notes, systolic, diastolic, bloodSugar, weight)
      VALUES 
        (@userId, @date, @doctorName, @diagnosis, @notes, @systolic, @diastolic, @bloodSugar, @weight);
      SELECT SCOPE_IDENTITY() AS recordId;
    `;
    const request = connection.request();
    request.input("userId", sql.Int, data.userId);
    request.input("date", sql.Date, data.date);
    request.input("doctorName", sql.NVarChar(100), data.doctorName);
    request.input("diagnosis", sql.NVarChar(255), data.diagnosis);
    request.input("notes", sql.NVarChar(100), data.notes);
    request.input("systolic", sql.Int, data.systolic || null);
    request.input("diastolic", sql.Int, data.diastolic || null);
    request.input("bloodSugar", sql.Int, data.bloodSugar || null);
    request.input("weight", sql.Float, data.weight || null);

    const result = await request.query(query);
    const newRecordId = result.recordset[0].recordId;

    // Retrieve and return the full record after insertion
    return await getRecordById(newRecordId);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// UPDATE an existing record by recordId
async function updateRecordById(id, data) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      UPDATE Records
      SET userId = @userId,
          date = @date,
          doctorName = @doctorName,
          diagnosis = @diagnosis,
          notes = @notes,
          systolic = @systolic,
          diastolic = @diastolic,
          bloodSugar = @bloodSugar,
          weight = @weight
      WHERE recordId = @id;
    `;
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("userId", sql.Int, data.userId);
    request.input("date", sql.Date, data.date);
    request.input("doctorName", sql.NVarChar(100), data.doctorName);
    request.input("diagnosis", sql.NVarChar(255), data.diagnosis);
    request.input("notes", sql.NVarChar(100), data.notes);
    request.input("systolic", sql.Int, data.systolic || null);
    request.input("diastolic", sql.Int, data.diastolic || null);
    request.input("bloodSugar", sql.Int, data.bloodSugar || null);
    request.input("weight", sql.Float, data.weight || null);
    
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return null; // Record not found
    }

    return await getRecordById(id); // Return updated record
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// DELETE a record by recordId
async function deleteRecordById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "DELETE FROM Records WHERE recordId = @id";
    const request = connection.request();
    request.input("id", sql.Int, id);
    const result = await request.query(query);

    // Returns 0 = not found, 1 = deleted
    return result.rowsAffected[0]; 
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

module.exports = {
  isDuplicateDate,
  getAllRecords,
  getRecordsByUserId,
  getRecordById,
  createRecord,
  updateRecordById,
  deleteRecordById,
};