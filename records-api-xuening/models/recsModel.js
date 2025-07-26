const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// GET all records
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

// GET record by ID
async function getRecordById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "'SELECT * FROM Records WHERE recordId = @id'";
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // Record not found
    }

    return result.recordset[0];
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

// CREATE a new record
async function createRecord(data) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO Records (userId, date, doctorName, diagnosis, notes)
      VALUES (@userId, @date, @doctorName, @diagnosis, @notes);
      SELECT SCOPE_IDENTITY() AS recordId;
    `;
    const request = connection.request();
    request.input("userId", sql.Int, data.userId);
    request.input("date", sql.Date, data.date);
    request.input("doctorName", sql.NVarChar(100), data.doctorName);
    request.input("diagnosis", sql.NVarChar(255), data.diagnosis);
    request.input("notes", sql.NVarChar(100), data.notes);
    const result = await request.query(query);

    const newRecordId = result.recordset[0].recordId;
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

// UPDATE a record by ID
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
          notes = @notes
      WHERE recordId = @id;
    `;
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("userId", sql.Int, data.userId);
    request.input("date", sql.Date, data.date);
    request.input("doctorName", sql.NVarChar(100), data.doctorName);
    request.input("diagnosis", sql.NVarChar(255), data.diagnosis);
    request.input("notes", sql.NVarChar(100), data.notes);
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return null; // Record not found
    }

    return await getRecordById(id);
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

// DELETE record by ID
async function deleteRecordById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "DELETE FROM Records WHERE recordId = @id";
    const request = connection.request();
    request.input("id", sql.Int, id);
    const result = await request.query(query);
    return result.rowsAffected[0]; // 0 = not found, 1 = deleted
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
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecordById,
  deleteRecordById,
};