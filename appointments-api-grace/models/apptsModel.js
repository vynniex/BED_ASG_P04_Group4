const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all appointments
async function getAllAppointmentsByUser(nric, fullName) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `Select appointment_id, appointment_date, appointment_time, clinic, reason 
                      From Appointments WHERE nric_fin = @nric and full_name = @name`;
        const request = connection.request();
        request.input("nric", nric);
        request.input("name", fullName);
        const result = await request.query(query);

        return result.recordset.map(appt => {
            const dateStr = new Date(appt.appointment_date).toLocaleDateString('en-SG', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                timeZone: 'Asia/Singapore'
            });

            const timeStr = appt.appointment_time

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
}

// Login user 
async function findUser(nric, fullName) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `Select * From Appointments WHERE nric_fin = @nric AND full_name = @name`;
    const request = connection.request();
    request.input("nric", nric);
    request.input("name", fullName);
    const result = await request.query(query);

    return result.recordset;
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

module.exports = {
  getAllAppointmentsByUser,
  createAppointment,
  findUser,
}