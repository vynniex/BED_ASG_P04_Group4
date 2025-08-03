const Joi = require("joi");

// Custom Joi extension for dd-mm-yyyy format
const customJoi = Joi.extend((joi) => ({
  type: 'customDate',
  base: joi.string(),
  messages: {
    'customDate.format': '{{#label}} must be in dd-mm-yyyy format',
  },
  validate(value, helpers) {
    const dateFormat = /^\d{2}-\d{2}-\d{4}$/; // "\d" means any digit (0–9)
    if (!dateFormat.test(value)) {
      return { value, errors: helpers.error('customDate.format') };
    }

    // Split the date string and check if it is a valid calendar date
    const [dd, mm, yyyy] = value.split('-').map(Number);
    // Create a JavaScript Date object using yyyy-mm-dd format (ISO format)
    const dateObj = new Date(`${yyyy}-${mm}-${dd}`);
    if (
      dateObj.getDate() !== dd ||
      dateObj.getMonth() + 1 !== mm || // months starts from 0 (January is 0), so +1 for comparison
      dateObj.getFullYear() !== yyyy
    ) {
      return { value, errors: helpers.error('customDate.format') };
    }

    return { value };
  },
}));

// Schema for record validation
const recordSchema = Joi.object({
    userId: Joi.number().integer().positive().required().messages({
    "number.base": "User ID must be a number",
    "number.integer": "User ID must be an integer",
    "number.positive": "User ID must be a positive number",
    "any.required": "User ID is required",
  }),
  date: customJoi.customDate().required(),
  doctorName: Joi.string().required().messages({
    "string.base": "Doctor name must be a string",
    "any.required": "Doctor name is required",
  }),
  diagnosis: Joi.string().required().messages({
    "string.base": "Diagnosis must be a string",
    "any.required": "Diagnosis is required",
  }),
  notes: Joi.string().max(100).allow(null, "").optional().messages({
    "string.base": "Notes must be a string",
    "string.max": "Notes must be within 100 characters",
  }),
  weight: Joi.number().min(30).max(300).precision(2).allow(null).optional().messages({
    "number.base": "Weight must be a number",
    "number.min": "Weight is unrealistically low",
    "number.max": "Weight is unrealistically high",
    "number.positive": "Weight must be a positive number",
  }),
  bloodSugar: Joi.number().min(40).max(400).allow(null).optional().messages({
    "number.base": "Blood sugar must be a number",
    "number.min": "Blood sugar is too low to be realistic",
    "number.max": "Blood sugar is too high to be realistic",
  }),
  systolic: Joi.number().integer().min(70).max(250).allow(null).optional().messages({
    "number.base": "Systolic must be a number",
    "number.integer": "Systolic must be an integer",
    "number.min": "Systolic is too low",
    "number.max": "Systolic is too high",
  }),
  diastolic: Joi.number().integer().min(60).max(150).allow(null).optional().messages({
    "number.base": "Diastolic must be a number",
    "number.integer": "Diastolic must be an integer",
    "number.min": "Diastolic is too low",
    "number.max": "Diastolic is too high",
  }),
});

// Middleware to validate record data
function validateRecord(req, res, next) {
  const { error } = recordSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ error: message });
  }

  // Convert date to yyyy-mm-dd format for SQL before passing to controller
  const [dd, mm, yyyy] = req.body.date.split("-");
  req.body.date = `${yyyy}-${mm}-${dd}`;

  next();
}

module.exports = {
  validateRecord,
};