const sql = require('mssql');
const dbConfig = require('../../dbConfig');

// Get all medicines
async function getAllMeds() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT * FROM Medications');

    return result.recordset.map(row => ({
      id: row.medicine_id,
      ...row
    }));
  } catch (error) {
    throw new Error(`Failed to retrieve medicines: ${error.message}`);
  }
}

// Get medicine by name
async function getMedByName(medicineName) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('medicine_name', sql.VarChar, medicineName)
      .query('SELECT * FROM Medications WHERE medicine_name = @medicine_name');

    if (result.recordset.length === 0) return null;

    return {
      id: result.recordset[0].medicine_id,
      ...result.recordset[0]
    };
  } catch (error) {
    throw new Error(`Failed to retrieve medicine: ${error.message}`);
  }
}

// Get medicines by userId
async function getMedsByUserId(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM Medications WHERE userId = @userId');

    return result.recordset.map(row => ({
      id: row.medicine_id,
      ...row
    }));
  } catch (error) {
    throw new Error(`Failed to retrieve medicines for user: ${error.message}`);
  }
}

// Create new medicine
async function createMed(medData) {
  try {
    const { userId, medicine_name, purpose, per_day, food_timing } = medData;

    if (!medicine_name) {
      throw new Error('Data for medicine is incomplete');
    }

    const pool = await sql.connect(dbConfig);

    // Check if exists
    const check = await pool.request()
      .input('medicine_name', sql.VarChar, medicine_name)
      .query('SELECT * FROM Medications WHERE medicine_name = @medicine_name');

    if (check.recordset.length > 0) {
      throw new Error('Medication already exists');
    }

    // Insert new
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('medicine_name', sql.VarChar, medicine_name)
      .input('purpose', sql.VarChar, purpose)
      .input('per_day', sql.Int, per_day)
      .input('food_timing', sql.VarChar, food_timing)
      .query(`
        INSERT INTO Medications (userId, medicine_name, purpose, per_day, food_timing)
        OUTPUT INSERTED.*
        VALUES (@userId, @medicine_name, @purpose, @per_day, @food_timing)
      `);

    return {
      id: result.recordset[0].medicine_id,
      ...result.recordset[0]
    };
  } catch (error) {
    throw new Error(`Failed to create medicine: ${error.message}`);
  }
}

// Update medicine
async function updateMed(medicineName, updates) {
  try {
    const { purpose, per_day, food_timing } = updates;

    const pool = await sql.connect(dbConfig);

    const check = await pool.request()
      .input('medicine_name', sql.VarChar, medicineName)
      .query('SELECT * FROM Medications WHERE medicine_name = @medicine_name');

    if (check.recordset.length === 0) {
      throw new Error('Medicine not found');
    }

    const result = await pool.request()
      .input('medicine_name', sql.VarChar, medicineName)
      .input('purpose', sql.VarChar, purpose)
      .input('per_day', sql.Int, per_day)
      .input('food_timing', sql.VarChar, food_timing)
      .query(`
        UPDATE Medications
        SET purpose = @purpose,
            per_day = @per_day,
            food_timing = @food_timing,
            updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE medicine_name = @medicine_name
      `);

    return {
      id: result.recordset[0].medicine_id,
      ...result.recordset[0]
    };
  } catch (error) {
    throw new Error(`Failed to update medicine: ${error.message}`);
  }
}

// Delete medicine by name
async function deleteMed(medicineName) {
  try {
    const pool = await sql.connect(dbConfig);

    const check = await pool.request()
      .input('medicine_name', sql.VarChar, medicineName)
      .query('SELECT * FROM Medications WHERE medicine_name = @medicine_name');

    if (check.recordset.length === 0) {
      throw new Error('Medicine not found');
    }

    await pool.request()
      .input('medicine_name', sql.VarChar, medicineName)
      .query('DELETE FROM Medications WHERE medicine_name = @medicine_name');

    return medicineName;
  } catch (error) {
    throw new Error(`Failed to delete medicine: ${error.message}`);
  }
}

// Delete medicine by ID
async function deleteMedById(medId) {
  try {
    const pool = await sql.connect(dbConfig);

    const check = await pool.request()
      .input('medId', sql.Int, medId)
      .query('SELECT * FROM Medications WHERE medicine_id = @medId');

    if (check.recordset.length === 0) {
      throw new Error('Medicine not found');
    }

    await pool.request()
      .input('medId', sql.Int, medId)
      .query('DELETE FROM Medications WHERE medicine_id = @medId');

    return medId;
  } catch (error) {
    throw new Error(`Failed to delete medicine: ${error.message}`);
  }
}

module.exports = {
  getAllMeds,
  getMedsByUserId,
  createMed,
  updateMed,
  deleteMedById
};