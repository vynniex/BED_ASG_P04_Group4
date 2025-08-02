const sql = require('mssql');
const dbConfig = require('../../dbConfig'); // Path to your db config

// NOTE: In a real app, you'd get this from the logged-in user's session/token.
const TEMP_USER_ID = 1; // Placeholder for the logged-in user's ID

// Helper function to parse frequency
const parseFrequency = (notification) => {
    if (notification && notification.frequency) {
        try {
            notification.frequency = JSON.parse(notification.frequency);
        } catch (e) {
            console.error(`Failed to parse frequency for notification ${notification.notificationId}:`, e);
            notification.frequency = []; // Default to empty array on error
        }
    }
    return notification;
};


// CREATE: Add a new notification to the SQL database
const addNotif = async (notifData) => {
  // The frontend sends 'type', 'date', 'time' etc. but the DB columns are named for reminders.
  // We'll map them here. The frontend uses 'reminderTitle', etc.
  const { reminderType, reminderTitle, description, date, time, timesPerDay, frequency } = notifData;
  const connection = await sql.connect(dbConfig);
  try {
    const query = `
      INSERT INTO Notifications (userId, reminderType, reminderTitle, description, reminderDate, reminderTime, timesPerDay, frequency)
      OUTPUT INSERTED.notificationId, INSERTED.userId, INSERTED.reminderType, INSERTED.reminderTitle, INSERTED.description, INSERTED.reminderDate, INSERTED.reminderTime, INSERTED.timesPerDay, INSERTED.frequency
      VALUES (@userId, @reminderType, @reminderTitle, @description, @reminderDate, @reminderTime, @timesPerDay, @frequency);
    `;
    const result = await connection.request()
      .input('userId', sql.Int, TEMP_USER_ID)
      .input('reminderType', sql.VarChar, reminderType)
      .input('reminderTitle', sql.VarChar, reminderTitle)
      .input('description', sql.NVarChar, description)
      .input('reminderDate', sql.Date, date)
      .input('reminderTime', sql.Time, time)
      .input('timesPerDay', sql.Int, timesPerDay)
      .input('frequency', sql.NVarChar, JSON.stringify(frequency || [])) // Store frequency array as a JSON string
      .query(query);
      
    return parseFrequency(result.recordset[0]);
  } finally {
    await connection.close();
  }
};

// READ: Get all notifications from the SQL database for a user
const getAllNotifs = async () => {
  const connection = await sql.connect(dbConfig);
  try {
    const result = await connection.request()
      .input('userId', sql.Int, TEMP_USER_ID)
      .query('SELECT notificationId, reminderType, reminderTitle, description, reminderDate, reminderTime, timesPerDay, frequency FROM Notifications WHERE userId = @userId');
    
    // Parse frequency string back to array for each notification
    return result.recordset.map(parseFrequency);
  } finally {
    await connection.close();
  }
};

// READ: Get a single notification by ID
const getNotifById = async (id) => {
  const connection = await sql.connect(dbConfig);
  try {
    const result = await connection.request()
      .input('id', sql.Int, id)
      .query('SELECT notificationId, reminderType, reminderTitle, description, reminderDate, reminderTime, timesPerDay, frequency FROM Notifications WHERE notificationId = @id');
    
    return parseFrequency(result.recordset[0]);
  } finally {
    await connection.close();
  }
};

// UPDATE: Update a notification in the SQL database by its ID
const updateNotifById = async (id, notifData) => {
  const { reminderType, reminderTitle, description, date, time, timesPerDay, frequency } = notifData;
  const connection = await sql.connect(dbConfig);
  try {
    const query = `
      UPDATE Notifications
      SET 
        reminderType = @reminderType,
        reminderTitle = @reminderTitle,
        description = @description,
        reminderDate = @reminderDate,
        reminderTime = @reminderTime,
        timesPerDay = @timesPerDay,
        frequency = @frequency
      WHERE notificationId = @id;
    `;
    await connection.request()
      .input('id', sql.Int, id)
      .input('reminderType', sql.VarChar, reminderType)
      .input('reminderTitle', sql.VarChar, reminderTitle)
      .input('description', sql.NVarChar, description)
      .input('reminderDate', sql.Date, date)
      .input('reminderTime', sql.Time, time)
      .input('timesPerDay', sql.Int, timesPerDay)
      .input('frequency', sql.NVarChar, JSON.stringify(frequency || []))
      .query(query);
      
    return { notificationId: id, ...notifData }; // Return the updated data
  } finally {
    await connection.close();
  }
};

// DELETE: Delete a notification from the SQL database by its ID
const deleteNotifById = async (id) => {
  const connection = await sql.connect(dbConfig);
  try {
    const result = await connection.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Notifications WHERE notificationId = @id');
    return result.rowsAffected[0] > 0;
  } finally {
    await connection.close();
  }
};

module.exports = {
  addNotif,
  getAllNotifs,
  getNotifById,  
  updateNotifById,
  deleteNotifById,
};
