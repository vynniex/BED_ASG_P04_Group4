const { doc, getDoc } = require('firebase/firestore');
const { db } = require('../../config/firebase')

const VALID_FOOD_TIMINGS = ['before', 'after'];

async function validateMedInput(req, res, next) {
  const { medicineName, purpose, perDay, foodTiming } = req.body;

  if (!medicineName || !purpose || perDay == null || !foodTiming) {
    return res.status(400).json({ error: 'All fields are required'})
  }

  if (typeof medicineName !== 'string' || medicineName.trim().length === 0) {
    return res.status(400).json({ error: 'Medicine name must be in alphabetical characters / must not be empty'});
  }

  if (typeof purpose !== 'string' || purpose.trim().length === 0) {
    return res.status(400).json({ error: 'Purpose must be in alphabetical characters / must not be empty'});
  }

  if (!Number.isInteger(perDay) || perDay < 1) {
    return res.status(400).json({ error: 'Per day must be a positive number'});
  }

  if (!VALID_FOOD_TIMINGS.includes(foodTiming)) {
    return res.status(400).json({
      error: `Food timing must be either one: ${VALID_FOOD_TIMINGS.join(', ')}`
    });
  }
  
  next();
};

async function validateMedName(req, res, next) {
  const medicineName = req.params.medName;

  if (!medicineName) {
    return res.status(400).json({ error: 'Medicine name is required'});
  }

  try {
    const docRef = doc(db, 'medications', medicineName);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Medicine not found'});
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to validate medicine'});
  }
}

module.exports = {
  validateMedInput,
  validateMedName
};