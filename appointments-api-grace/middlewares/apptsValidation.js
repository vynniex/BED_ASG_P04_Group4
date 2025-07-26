const jwt = require("jsonwebtoken");
const Joi = require("joi"); // Import Joi for validation

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, "your_appointment_secret", (err, decoded) => {
      if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
      }

      // Attach NRIC and fullName (or whatever data you encoded) to req.user
      req.user = decoded;
      console.log(req.user);
      next();
    });
};

const apptSchema = Joi.object({
  nric: Joi.string()
    .alphanum()
    .min(6)
    .max(12)
    .required()
    .label("NRIC/FIN"),

  fullName: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/)
    .min(3)
    .max(100)
    .required()
    .label("Full Name"),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email Address"),

  contact: Joi.string()
    .pattern(/^[89]\d{7}$/) 
    .required()
    .label("Contact Number"),

  dob: Joi.date()
    .less("now")
    .iso()
    .required()
    .label("Date of Birth"),

  appointmentDate: Joi.date()
    .min("now")
    .required()
    .label("Appointment Date"),

   appointmentTime: Joi.string()
    .valid(
      "9:00 AM",
      "10:00 AM",
      "11:00 AM",
      "2:00 PM",
      "3:00 PM",
      "4:00 PM",
      "5:00 PM"
    )
    .required()
    .label("Appointment Time"),

  clinic: Joi.string()
    .valid(
      "Bedok Polyclinic",
      "Bukit Merah Polyclinic",
      "Eunos Polyclinic",
      "Marine Parade Polyclinic",
      "Paris Ris Polyclinic",
      "Punggol Polyclinic",
      "Outram Polyclinic",
      "Sengkang Polyclinic",
      "Tampines Polyclinic"
    )
    .required()
    .label("Clinic"),

  reason: Joi.string()
    .valid(
      "General Consultation",
      "Headache / Migraine",
      "Follow-up Appointment",
      "Referral Request",
      "Vaccination / Immunization",
      "Mental Health Consultation"
    )
    .required()
    .label("Reason for Appointment"),
});

// Middleware to validate appt data (for POST/PUT)
function validateAppt(req, res, next) {
  // Validate the request body against the bookSchema
  const { error } = apptSchema.validate(req.body, { abortEarly: false }); // abortEarly: false collects all errors

  if (error) {
    // If validation fails, format the error messages and send a 400 response
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  // If validation succeeds, pass control to the next middleware/route handler
  next();
}

const loginSchema = Joi.object({
  nric: Joi.string().required(),
  fullName: Joi.string().required(),
})

function validateLogin(req, res, next) {
  // Validate the request body against the bookSchema
  const { error } = loginSchema.validate(req.body, { abortEarly: false }); // abortEarly: false collects all errors

  if (error) {
    // If validation fails, format the error messages and send a 400 response
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  // If validation succeeds, pass control to the next middleware/route handler
  next();
}

module.exports = {
  verifyJWT,
  validateAppt,
  validateLogin,
};