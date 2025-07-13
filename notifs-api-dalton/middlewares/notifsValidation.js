// Renamed to validateNotif to match the context
const validateNotif = (req, res, next) => {
  // Fields based on the wireframe for "Create New Reminder"
  const { reminderType, reminderTitle, description, date, time, frequency } = req.body;
  const errors = [];

  if (!reminderType) {
    errors.push("Reminder Type is required.");
  }
  if (!reminderTitle) {
    errors.push("Reminder Title is required.");
  }
  if (!description) {
    errors.push("Description is required.");
  }
  if (!date) {
    errors.push("Date is required.");
  }
  if (!time) {
    errors.push("Time is required.");
  }
  if (!frequency) {
    errors.push("Frequency is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = {
  validateNotif,
};