const Joi = require('joi');

// This schema is used for both POST and PUT. It validates the entire request body.
const medInputSchema = Joi.object({
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

module.exports = {
  validateMedInput
};