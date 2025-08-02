const sql = require('mssql');
const dbConfig = require('../../dbConfig'); 

const TEMP_USER_ID = 1;

// Helper function to parse JSON fields from the database
const parseJSONFields = (notification) => {
    if (notification) {
        // Parse frequency
        if (notification.frequency) {
            try {
                notification.frequency = JSON.parse(notification.frequency);
            } catch (e) {
                notification.frequency = [];
            }
        }
        // Parse reminderTimes
        if (notification.reminderTimes) {
            try {
                notification.reminderTimes = JSON.parse(notification.reminderTimes);
            } catch (e) {
                notification.reminderTimes = [];
            }
        }
    }
    return notification;
};

// CREATE: Add a new notification
const addNotif = async (notifData) => {
  const { reminderType, reminderTitle, description, date, reminderTimes, timesPerDay, frequency } = notifData;
  const connection = await sql.connect(dbConfig);
  try {
    const query = `
      INSERT INTO Notifications (userId, reminderType, reminderTitle, description, reminderDate, reminderTimes, timesPerDay, frequency)
      OUTPUT INSERTED.*
      VALUES (@userId, @reminderType, @reminderTitle, @description, @reminderDate, @reminderTimes, @timesPerDay, @frequency);
    `;
    const result = await connection.request()
      .input('userId', sql.Int, TEMP_USER_ID)
      .input('reminderType', sql.VarChar, reminderType)
      .input('reminderTitle', sql.VarChar, reminderTitle)
      .input('description', sql.NVarChar, description)
      .input('reminderDate', sql.Date, date)
      .input('reminderTimes', sql.NVarChar, JSON.stringify(reminderTimes || []))
      .input('timesPerDay', sql.Int, timesPerDay)
      .input('frequency', sql.NVarChar, JSON.stringify(frequency || []))
      .query(query);
      
    return parseJSONFields(result.recordset[0]);
  } finally {
    await connection.close();
  }
};

// READ: Get all notifications
const getAllNotifs = async () => {
  const connection = await sql.connect(dbConfig);
  try {
    const result = await connection.request()
      .input('userId', sql.Int, TEMP_USER_ID)
      .query('SELECT * FROM Notifications WHERE userId = @userId');
    
    return result.recordset.map(parseJSONFields);
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
      .query('SELECT * FROM Notifications WHERE notificationId = @id');
    
    return parseJSONFields(result.recordset[0]);
  } finally {
    await connection.close();
  }
};

// UPDATE: Update a notification by ID
const updateNotifById = async (id, notifData) => {
  const { reminderType, reminderTitle, description, date, reminderTimes, timesPerDay, frequency } = notifData;
  const connection = await sql.connect(dbConfig);
  try {
    const query = `
      UPDATE Notifications
      SET 
        reminderType = @reminderType,
        reminderTitle = @reminderTitle,
        description = @description,
        reminderDate = @reminderDate,
        reminderTimes = @reminderTimes,
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
      .input('reminderTimes', sql.NVarChar, JSON.stringify(reminderTimes || []))
      .input('timesPerDay', sql.Int, timesPerDay)
      .input('frequency', sql.NVarChar, JSON.stringify(frequency || []))
      .query(query);
      
    return { notificationId: id, ...notifData };
  } finally {
    await connection.close();
  }
};

// DELETE: Delete a notification by ID
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
