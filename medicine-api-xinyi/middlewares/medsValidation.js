const Joi = require('joi');

const medInputSchema = Joi.object({
  // medicine_name is now always required in the body for POST and PUT
  medicine_name: Joi.string().trim().required().messages({
    'string.empty': 'Medicine name is required',
    'any.required': 'Medicine name is required'
  }),
  purpose: Joi.string().trim().required().messages({
    'string.empty': 'Purpose is required',
    'any.required': 'Purpose is required'
  }),
  per_day: Joi.number().integer().min(1).required().messages({
    'number.base': 'Per day must be a number',
    'number.integer': 'Per day must be an integer',
    'number.min': 'Per day must be at least 1',
    'any.required': 'Per day is required'
  }),
  food_timing: Joi.string().valid('before', 'after').required().messages({
    'any.only': 'Food timing must be either "before" or "after"',
    'any.required': 'Food timing is required'
  }),
});

function validateMedInput(req, res, next) {
  const { error } = medInputSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(d => d.message);
    return res.status(400).json({ error: errors.join(', ') });
  }
  next();
}

// This schema is no longer used for the PUT route but can be kept for other potential uses.
const medNameSchema = Joi.string().trim().required().messages({
  'string.empty': 'Medicine name is required',
  'any.required': 'Medicine name is required'
});

function validateMedName(req, res, next) {
  const { error } = medNameSchema.validate(req.params.medName);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = {
  validateMedInput,
  validateMedName
};