const {
  collection,
  getDocs,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} = require("firebase/firestore");
const {db} = require("../../config/firebase");


// Get all appointments
async function getAllAppointmentsByUser(nric, fullName) {
    try {
        const connection = await collection(db, "appointments");
        const q = query(
          connection,
          where("nric_fin", "==", nric),
          where("full_name", "==", fullName)
        );

        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => {
          const data = doc.data();

          // Convert Firestore Timestamp to JS Date and format it
          const dateStr = data.appointment_date.toDate().toLocaleString('en-SG', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            timeZone: 'Asia/Singapore'
          });

          // Return only selected fields
          return {
            appointment_id: data.appointment_id,
            appointment_date: data.appointment_date,
            appointment_time: data.appointment_time,
            clinic: data.clinic,
            reason: data.reason,
            formatted_datetime: `${dateStr} at ${data.appointment_time}`,
          };
        });

        return results;

    } catch(error) {
        console.error("Error getting appointments: ", error);
        throw error;
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