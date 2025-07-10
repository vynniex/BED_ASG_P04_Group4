const {
  collection,
  getDocs,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
} = require("firebase/firestore");
const {db} = require("../../config/firebase");


// Get all appointments
async function getAllAppointmentsByUser(nric, fullName) {
    try {
        const connection = collection(db, "appointments");
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
            appointment_id: doc.id,
            appointment_date: dateStr,
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
  try {
    const connection = await collection(db, "appointments");
    const q = query(
      connection,
      where("nric_fin", "==", nric),
      where("full_name", "==", fullName)
    );
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => ({
      id: doc.id, // Firestore document ID
      ...doc.data()
    }));

    return results;
  } catch(error) {
    console.error("Firebase error: ", error);
    throw error;
  }
}

// Create new appointment
async function createAppointment(appointmentData) {
  try {
    const connection = await collection(db, "appointments");

    const dob = new Date(appointmentData.dob);
    const appt_date = new Date(appointmentData.appointmentDate)

    const newAppt = {
      nric_fin: appointmentData.nric,
      full_name: appointmentData.fullName,
      email: appointmentData.email,
      contact_num: appointmentData.contact,
      dob: Timestamp.fromDate(dob),
      appointment_date: Timestamp.fromDate(appt_date),
      appointment_time: appointmentData.appointmentTime,
      clinic: appointmentData.clinic,
      reason: appointmentData.reason,
    };
    console.log(newAppt);
    const docRef = await addDoc(connection, newAppt);

    console.log("Appointment created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Firebase error:", error);
    throw error;
  }
}

// update appointment
async function updateAppointmentById(id, updatedData) {
  try {
    const docRef = doc(db, "appointments", id);
    const docSnap = await getDoc(docRef);

    console.log(docSnap.data());
    if (!docSnap.exists()) {
      throw new Error("Document does not exist.");
    }

    const updateFields = {
      contact_num: updatedData.contact,
      clinic: updatedData.clinic,
      appointment_date: Timestamp.fromDate(new Date(updatedData.appointmentDate)),
      appointment_time: updatedData.appointmentTime,
    };
    console.log(updateFields);

    await updateDoc(docRef, updateFields);

    return {success: true};
  } catch (error) {
    console.error("Firebase error:", error);
    throw error;
  } 
}

// Delete appointment
async function deleteAppointmentById(id) {
  try {
    console.log("ID type:", typeof id, "| value:", id);
    await deleteDoc(doc(db, "appointments", id));
    console.log("Deleted appointment with document ID:", id);
    return 1; // success

  } catch(error) {
    console.error("Error in deleting appointments: ", error);
    throw error;
  }
}

module.exports = {
  getAllAppointmentsByUser,
  createAppointment,
  findUser,
  updateAppointmentById,
  deleteAppointmentById,
}