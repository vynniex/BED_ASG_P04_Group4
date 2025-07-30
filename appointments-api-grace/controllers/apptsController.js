const appointmentModel = require("../models/apptsModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

// create user account
async function createUser(req,res) {
  const userData = req.body;
  try {
    if (!userData) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await appointmentModel.findUser(userData.email);
    console.log(existingUser);

    if (existingUser) {
      return res.status(409).json({message: "User already exisits. "}) // 409 conflict - prevent duplicates
    }

    // Hash password and nric
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
    userData.nric = await bcrypt.hash(userData.nric, salt);

    const newUser = await appointmentModel.createUser(userData);
    console.log(newUser);
    res.status(201).json(newUser);
  } catch(error) {
    console.error("Controller error: ", error);
    res.status(500).json({error: "Error creating account for user."});
  }
};


// login user
async function loginUser(req, res) {
  const { email, password } = req.body;
  console.log(req.body);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required." });
  }

  try {
    const user = await appointmentModel.findUserByEmail(email);
    console.log(user);

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password); // compare hash
      if (isMatch) {
        const payload = {
          id: user.userId,
        };
        console.log(payload);
        const token = jwt.sign(payload, "your_appointment_secret", { expiresIn: "12h" });

        return res.status(200).json({ message: `Login successful`, token, 
          user: {
            fullName: user.full_name,
            email: user.email,
            contact: user.contact_num,
            dob: user.dob
          }
        });
      }
    } 

    // no match
    return res.status(401).json({message: "Invalid Email or Password"});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Verify user
async function verify(req,res) {
  const { nric } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!nric || !token) {
    return res.status(400).json({ message: "NRIC and token are required." });
  }
  try {
    const decoded = jwt.verify(token, "your_appointment_secret");
    const user = await appointmentModel.findUserById(decoded.id);
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(nric, user.nric_fin);
    if (isMatch) {
      return res.status(200).json({ message: "NRIC verification successful." });
    } else {
      return res.status(401).json({ message: "NRIC does not match." });
    }
  } catch (error) {
    console.error("Verification error: ", error);
    return res.status(500).json({ message: "Server error" });
  }
}


// Create new appointment
async function createAppointment(req, res) {
  try {
    const appointmentData = req.body;
    const userId = req.user.id;
    console.log(req.user);
    console.log(req.user.id);
        
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
  createAppointment,
  createUser,
  loginUser,
  verify,
  updateAppointmentById,
  deleteAppointmentById
}