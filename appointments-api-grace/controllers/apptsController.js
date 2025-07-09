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
async function login(req, res) {
  const { nric, fullName } = req.body;

  if (!nric || !fullName) {
    return res.status(400).json({ message: "NRIC and Full Name are required." });
  }

  try {
    const user = await appointmentModel.findUser(nric, fullName);

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

module.exports = {
  getAllAppointmentsByUser,
  createAppointment,
  login,
}