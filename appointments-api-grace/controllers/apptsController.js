const appointmentModel = require("../models/apptsModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Get all appointments
async function getAllAppointmentsByUser(req,res) {
  const {fullName} = req.user;
  try {
    const appointments = await appointmentModel.getAllAppointmentsByUser(fullName);
    res.json(appointments);
  } catch (error) {
    console.error("Controller error: ", error);
    res.status(500).json({error: "Error retrieving appointments for user."});
  }
};

// create user account
async function createUser(req,res) {
  const { nric, fullName, email, password, contact, dob} = req.body;
  try {
    if (!nric || !fullName || !email || !password || !contact || !dob) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Hash password and nric
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    nric = await bcrypt.hash(nric, salt);

    const userData= {
      nric,
      fullName,
      email,
      contact,
      password: hashedPassword,
      dob
    }

    const newUser = await appointmentModel.createUser(userData);
    res.json(newUser);
  } catch(error) {
    console.error("Controller error: ", error);
    res.status(500).json({error: "Error creating account for user."});
  }
};


// login user
async function loginUser(req, res) {
  const { nric, fullName } = req.body;
  console.log(req.body);

  if (!nric || !fullName) {
    return res.status(400).json({ message: "NRIC and Full Name are required." });
  }

  try {
    const users = await appointmentModel.loginUser(fullName);

    for (const user of users) {
      const isMatch = await bcrypt.compare(nric, user.nric_fin); // compare hash
      if (isMatch) {
        const payload = {
          id: user.appointment_id,
          fullName: user.full_name,
        };
        console.log(payload);
        const token = jwt.sign(payload, "your_appointment_secret", { expiresIn: "24h" });

        return res.status(200).json({ message: `Login successful`, token });
      }
    } 

    // no match
    return res.status(401).json({message: "Invalid NRIC or Full Name"});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Create new appointment
async function createAppointment(req, res) {
  try {
    const appointmentData = req.body;

    if (req.user) {
      // if the user has logged in alr
      appointmentData.nric = req.user.nric;
      appointmentData.fullName = req.user.fullName;
    }
    else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      appointmentData.nric = await bcrypt.hash(appointmentData.nric, salt);
    }
    
    const newAppointment = await appointmentModel.createAppointment(appointmentData);
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