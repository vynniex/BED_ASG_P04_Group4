const sql = require('mssql');
const dbConfig = require('../../dbConfig');

// Get all medicines for a specific user
async function getMedsByUserId(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM Medications WHERE userId = @userId');

    return result.recordset;
  } catch (error) {
    throw new Error(`Failed to retrieve medicines for user: ${error.message}`);
  }
}

// Get a single medicine by its ID
async function getMedById(medId) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('medId', sql.Int, medId)
            .query('SELECT * FROM Medications WHERE medicine_id = @medId');

        if (result.recordset.length === 0) return null;

        return result.recordset[0];
    } catch (error) {
        throw new Error(`Failed to retrieve medicine: ${error.message}`);
    }
}

// Create new medicine
async function createMed(medData) {
  try {
    const { userId, medicine_name, purpose, per_day, food_timing } = medData;
    const pool = await sql.connect(dbConfig);

    // Check if a medicine with the same name already exists FOR THIS USER
    const check = await pool.request()
      .input('userId', sql.Int, userId)
      .input('medicine_name', sql.VarChar, medicine_name)
      .query('SELECT * FROM Medications WHERE medicine_name = @medicine_name AND userId = @userId');

    if (check.recordset.length > 0) {
      throw new Error('You have already registered this medication.');
    }

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

    return result.recordset[0];
  } catch (error) {
    throw new Error(`Failed to create medicine: ${error.message}`);
  }
}

// Update medicine by its ID
async function updateMed(medId, updates) {
  try {
    const { medicine_name, purpose, per_day, food_timing } = updates;
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('medId', sql.Int, medId)
      .input('medicine_name', sql.VarChar, medicine_name)
      .input('purpose', sql.VarChar, purpose)
      .input('per_day', sql.Int, per_day)
      .input('food_timing', sql.VarChar, food_timing)
      .query(`
        UPDATE Medications
        SET medicine_name = @medicine_name,
            purpose = @purpose,
            per_day = @per_day,
            food_timing = @food_timing,
            updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE medicine_id = @medId
      `);

    if (result.recordset.length === 0) {
      throw new Error('Update failed: Medicine not found.');
    }
    return result.recordset[0];
  } catch (error) {
    // Handle potential unique constraint violation on 'medicine_name'
    if (error.message.includes('UNIQUE KEY constraint')) {
        throw new Error('This medicine name is already taken.');
    }
    throw new Error(`Failed to update medicine: ${error.message}`);
  }
}

// Delete medicine by ID
async function deleteMedById(medId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('medId', sql.Int, medId)
      .query('DELETE FROM Medications WHERE medicine_id = @medId');

    if (result.rowsAffected[0] === 0) {
        throw new Error('Medicine not found for deletion.');
    }
    return medId;
  } catch (error) {
    throw new Error(`Failed to delete medicine: ${error.message}`);
  }
}

module.exports = {
  getMedsByUserId,
  getMedById,
  createMed,
  updateMed,
  deleteMedById,
};