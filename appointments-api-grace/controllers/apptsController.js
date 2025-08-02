const appointmentModel = require("../models/apptsModel");

// Get all appointments
async function getAllAppointmentsByUser(req,res) {
  const userId = req.user.id;
  try {
    const appointments = await appointmentModel.getAllAppointmentsByUser(userId);
    res.json(appointments);
  } catch (error) {
    console.error("Controller error: ", error);
    res.status(500).json({error: "Error retrieving appointments for user."});
  }
};

// Get appointment by id
async function getAppointmentById(req,res) {
  const appointmentId = req.params.id;
  console.log(appointmentId);
  try {
    const appointments = await appointmentModel.getAppointmentById(appointmentId);
    res.json(appointments);
    console.log(appointments);
  } catch (error) {
    console.error("Controller error: ", error);
    res.status(500).json({error: "Error retrieving appointment's information for user."});
  }
};

// Create new appointment
async function createAppointment(req, res) {
  try {
    const appointmentData = req.body;
    const userId = req.user.id;
    console.log(req.user);
    console.log(req.user.id);
    console.log(appointmentData);
        
    const newAppointment = await appointmentModel.createAppointment(userId, appointmentData);
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
    const { appointment_date, appointment_time, clinic } = req.body;
    console.log("Updating doc with ID:", id);

    const updateData = {
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
  getAppointmentById,
  createAppointment,
  updateAppointmentById,
  deleteAppointmentById,
}