const userModel = require("../models/userModel.js");
const appointmentModel = require("../models/apptsModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// create user account
async function createUser(req,res) {
  const userData = req.body;
  try {
    if (!userData) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await userModel.findUserByEmail(userData.email);
    console.log(existingUser);

    if (existingUser) {
      return res.status(409).json({message: "User's email already exisits. "}) // 409 conflict - prevent duplicates
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
    const user = await userModel.findUserByEmail(email);
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
    const user = await userModel.findUserById(decoded.id);
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

// Get user's info by userId
async function getUserDetailsById(req,res) {
  const userId = req.user.id;
  try {
    const user = await userModel.findUserById(userId);
    console.log(user);
    res.json(user);
  } catch(error) {
    console.error("Controller error: ", error);
    return res.status(500).json({ message: "Server error" });
  }
}

// Delete user by Id
async function deleteUserById(req,res) {
  try {
    const id = req.params.id;
    console.log(id);
    console.log(typeof id);
    if (!id || typeof id != "string") {
      return res.status(400).json({ error: "Invalid userId" });
    }

    // check if user still have appointments
    const appointments = await appointmentModel.getAllAppointmentsByUser(id);
    if (appointments.length > 0) {
      return res.status(400).json({ error: "User has exisitng appointments and cannot be deleted." });
    }
    
    // if not, delete user
    await userModel.deleteUserById(id);
    return res.status(204).send();
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting User's account." });
  }
}

module.exports = {
    createUser,
    loginUser,
    verify,
    getUserDetailsById,
    deleteUserById
}