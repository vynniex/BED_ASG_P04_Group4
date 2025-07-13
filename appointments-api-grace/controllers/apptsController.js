const appointmentModel = require("../models/apptsModel");

// Get all appointments
async function getAllAppointmentsByUser(req,res) {
  const { nric, fullName} = req.params;
  try {
        const appointments = await appointmentModel.getAllAppointmentsByUser(nric,fullName);
        res.json(appointments);
    } catch (error) {
        console.error("Controller error: ", error);
        res.status(500).json({error: "Error retrieving appointments for user."});
  }
};

// login user
async function loginUser(req, res) {
  const { nric, fullName } = req.body;

  if (!nric || !fullName) {
    return res.status(400).json({ message: "NRIC and Full Name are required." });
  }

  try {
    const user = await appointmentModel.loginUser(nric, fullName);

    if (user && user.length > 0) {
      return res.status(200).json({ message: "Login successful", user });
    } else {
      return res.status(401).json({ message: "Invalid NRIC or Full Name" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Create new appointment
async function createAppointment(req, res) {
  try {
    const newAppointment = await appointmentModel.createAppointment(req.body);
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating Appointment." });
  }
}

// Update existing appointment
async function updateAppointmentById(req, res) {
  try {
    const id = req.params.id.trim();
    const { contact, appointment_date, appointment_time, clinic } = req.body;
    console.log("Updating doc with ID:", id);

    const updateData = {
      contact: contact?.trim(),
      appointmentDate: appointment_date?.trim(),
      appointmentTime: appointment_time?.trim(),
      clinic: clinic?.trim()
    };

    const appointment = await appointmentModel.updateAppointmentById(id,updateData);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error updating appointment" });
  }
}

// Delete appointment by Id
async function deleteAppointmentById(req,res) {
  try {
    const id = req.params.id;
    if (!id || typeof id != "string") {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }

    const rowsDeleted = await appointmentModel.deleteAppointmentById(id);
    if (rowsDeleted === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    
    return res.status(204).send();
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting Appointment." });
  }
}


module.exports = {
  getAllAppointmentsByUser,
  createAppointment,
  loginUser,
  updateAppointmentById,
  deleteAppointmentById
}