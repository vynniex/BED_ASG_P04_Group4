const { db } = require("../../config/firebase");
const { doc, getDoc } = require("firebase/firestore");

const validFeelings = ["Good", "Okay", "Bad"];

async function validateRecord(req, res, next) {
  const { date, feeling, systolic, diastolic, bloodSugar, weight } = req.body;

  // Check for missing fields
  if (!date || !feeling || systolic == null || diastolic == null || bloodSugar == null || weight == null) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Date must be in YYYY-MM-DD format." });
  }

  // Validate feeling
  if (!validFeelings.includes(feeling)) {
    return res.status(400).json({ error: "Feeling must be either Good, Okay or Bad." });
  }

  // Validate number ranges
  if (!Number.isInteger(systolic) || systolic < 80 || systolic > 200) 
    return res.status(400).json({ error: "Systolic must be an integer between 80 and 200." });

  if (!Number.isInteger(diastolic) || diastolic < 50 || diastolic > 130) 
    return res.status(400).json({ error: "Diastolic must be an integer between 50 and 130." });

  if (!Number.isInteger(bloodSugar) || bloodSugar < 50 || bloodSugar > 300) 
    return res.status(400).json({ error: "Blood sugar must be an integer between 50 and 300." });

  if (weight < 30.0 || weight > 200.0) 
    return res.status(400).json({ error: "Weight must be between 30.0 and 200.0." });

  // Round weight to 1 decimal place
  req.body.weight = Math.round(weight * 10) / 10;

  // docId naming convention
  const docId = `${date.replace(/-/g, "_")}_record`;

  // Check if document already exists
  const docSnap = await getDoc(doc(db, "records", docId));
  const isUpdating = req.method === "PUT";
  const updatingSameDoc = isUpdating && req.params.id === docId;

  // Prevent duplicate date entry
  if (docSnap.exists() && !updatingSameDoc) {
    return res.status(400).json({ error: "Medical record with this date already exists." });
  }

  next();
}
module.exports = {
    validateRecord 
};