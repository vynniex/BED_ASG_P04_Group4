// This validation is updated to handle multiple time inputs.
const validateNotif = (req, res, next) => {
  // Fields based on the "Create New Reminder" form with multiple times
  const { reminderType, reminderTitle, description, date, reminderTimes, timesPerDay } = req.body;
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
  // Check for the array of times instead of a single time
  if (!reminderTimes || !Array.isArray(reminderTimes) || reminderTimes.length === 0) {
    errors.push("At least one reminder time is required.");
  }
  if (timesPerDay === undefined || timesPerDay === null) {
    errors.push("Times per day is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = {
  validateNotif,
};