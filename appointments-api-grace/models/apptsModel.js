const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Get all appointments
async function getAllAppointmentsByUser(fullName) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `Select * 
      From Appointments WHERE full_name = @name`; // appointment_id, contact_num, appointment_date, appointment_time, clinic, reason 
    const request = connection.request();
    request.input("name", fullName);
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
          // Return only selected fields
          // return {
          //   appointment_id: doc.id,
          //   appointment_date: dateStr,
          //   appointment_time: data.appointment_time,
          //   clinic: data.clinic,
          //   reason: data.reason,
          //   formatted_datetime: `${dateStr} at ${data.appointment_time}`,
          // };

// Login user 
async function loginUser(fullName) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `SELECT * FROM Appointments WHERE full_name = @name`;
    const request = connection.request();
    request.input("name", fullName);
    const result = await request.query(query);

    return result.recordset; // Return all users with that name
  } catch(error) {
    console.error("Database error: ", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch(err) {
        console.error("Error closing database: ", err);
      }
    }
  }
}

// Create new appointment
async function createAppointment(appointmentData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      `INSERT INTO Appointments (nric_fin, full_name, email, contact_num, dob, appointment_date, appointment_time, clinic, reason) 
        VALUES (@nric_fin, @full_name, @email, @contact_num, @dob, @appointment_date, @appointment_time, @clinic, @reason); SELECT SCOPE_IDENTITY() AS appointment_id;`;
    const request = connection.request();
    console.log("Test:" ,appointmentData);
    request.input("nric_fin", appointmentData.nric);
    request.input("full_name", appointmentData.fullName);
    request.input("email", appointmentData.email);
    request.input("contact_num", appointmentData.contact);
    request.input("dob", appointmentData.dob);
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
    SET contact_num = @contact_num, appointment_date = @apptDate, appointment_time = @apptTime, clinic = @clinic
    WHERE appointment_id = @id
    `;
    const request = connection.request();
    request.input("contact_num", updatedData.contact);
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
  createAppointment,
  loginUser,
  updateAppointmentById,
  deleteAppointmentById,
}