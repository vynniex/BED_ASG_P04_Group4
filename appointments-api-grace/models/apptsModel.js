const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Get all appointments
async function getAllAppointmentsByUser(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `Select * 
      From Appointments WHERE userId = @userId`; // appointment_id, contact_num, appointment_date, appointment_time, clinic, reason 
    const request = connection.request();
    request.input("userId", userId);
    const result = await request.query(query);

    return result.recordset.map(appt => {
      const dateStr = new Date(appt.appointment_date).toLocaleDateString('en-SG', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        timeZone: 'Asia/Singapore'
      });

      const timeStr = appt.appointment_time
      console.log({...appt, formatted_datetime: `${dateStr} at ${timeStr}`});
      return { ...appt, formatted_datetime: `${dateStr} at ${timeStr}` };
            
    });
    } catch(error) {
      console.error("Database error: ", error);
      throw error;
    } finally {
    if (connection) {
      try {
        await connection.close();
      } catch(err) {
        console.error("Error closing database:", err);
      }
    }
  }
};

// Get appointment by appointmentId
async function getAppointmentById(appointmentId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `Select appointment_date, appointment_time, clinic From Appointments WHERE appointment_id = @appointmentId`;
    const request = connection.request();
    request.input("appointmentId", appointmentId);
    const result = await request.query(query);

    return result.recordset[0];
  } catch(error) {
    console.error("Database error: ", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch(err) {
        console.error("Error closing database:", err);
      }
    }
  }
}

// Create new appointment
async function createAppointment(userId, appointmentData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      `INSERT INTO Appointments (userId, appointment_date, appointment_time, clinic, reason) 
        VALUES (@userId, @appointment_date, @appointment_time, @clinic, @reason); SELECT SCOPE_IDENTITY() AS appointment_id;`;
    const request = connection.request();
    console.log("Test:" ,appointmentData);
    request.input("userId", userId)
    request.input("appointment_date", appointmentData.appointmentDate);
    request.input("appointment_time", appointmentData.appointmentTime);
    request.input("clinic", appointmentData.clinic);
    request.input("reason", appointmentData.reason);
    const result = await request.query(query);

    const newAppointmentId = result.recordset[0].appointment_id;
    return newAppointmentId;
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

// update appointment
async function updateAppointmentById(id, updatedData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
    UPDATE Appointments
    SET appointment_date = @apptDate, appointment_time = @apptTime, clinic = @clinic
    WHERE appointment_id = @id`;
    const request = connection.request();
    request.input("apptDate", updatedData.appointmentDate);
    request.input("apptTime", updatedData.appointmentTime);
    request.input("clinic", updatedData.clinic);
    request.input("id", id);
    
    await request.query(query);

    return {success: true};
  }catch (error) {
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

// Delete appointment
async function deleteAppointmentById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `Delete From Appointments where appointment_id = @id`;
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    return result.rowsAffected[0];
  } catch(error) {
    console.error("Error in Delete /appointments: ", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch(closeError){
        console.error("Error closing database collection: ", closeError);
      }
    }
  }
}



module.exports = {
  getAllAppointmentsByUser,
  getAppointmentById,
  createAppointment,
  updateAppointmentById,
  deleteAppointmentById,
}