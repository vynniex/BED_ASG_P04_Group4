const { doc, getDoc } = require('firebase/firestore');
const { db } = require('../../config/firebase')

const VALID_FOOD_TIMINGS = ['before', 'after'];

const validateMedInput = async (req, res, next) => {
  const { medName, purpose, perDay, foodTiming } = req.body;
  const errors = [];

  if (!medName) errors.push('Medicine name is required');
  if (!purpose) errors.push('Purpose is required');
  if (!Number.isInteger(perDay)) errors.push('Per day must be a number');
  if (!VALID_FOOD_TIMINGS.includes(foodTiming)) {
    errors.push(`Food timing must be: ${VALID_FOOD_TIMINGS.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }
  next();
};

const validateMedName = async (req, res, next) => {
  const medName = req.params.medName;
    if (!medName) {
      return res.status(400).json({
        success: false,
        error: 'Medicine name is required'
      });
    }

    try {
      const docRef = doc(db, "medications", medName);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return res.status(404).json({
          success: false,
          error: 'Medicine not found'
        });
      }
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || "Console error"
      });
    }
  };

module.exports = {
  validateMedInput,
  validateMedName
};