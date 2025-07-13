const notifModel = require('../models/notifsModel.js');

// CREATE a new notification
const createNotification = async (req, res) => {
  try {
    const newNotif = await notifModel.addNotif(req.body);
    res.status(201).json(newNotif);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification', error: error.message });
  }
};

// GET all notifications
const getAllNotifications = async (req, res) => {
  try {
    const notifs = await notifModel.getAllNotifs();
    res.status(200).json(notifs);
  } catch (error) {
    res.status(500).json({ message: 'Error getting notifications', error: error.message });
  }
};

// GET a single notification by ID
const getNotificationById = async (req, res) => {
  try {
    const notif = await notifModel.getNotifById(req.params.id);
    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json(notif);
  } catch (error) {
    res.status(500).json({ message: 'Error getting notification', error: error.message });
  }
};


// UPDATE a notification by ID
const updateNotification = async (req, res) => {
  try {
    const updatedNotif = await notifModel.updateNotifById(req.params.id, req.body);
    if (!updatedNotif) {
        return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json(updatedNotif);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};

// DELETE a notification by ID
const deleteNotification = async (req, res) => {
  try {
    await notifModel.deleteNotifById(req.params.id);
    res.status(200).json({ message: "Notification successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
};

module.exports = {
  createNotification,
  getAllNotifications,
  getNotificationById,   
  updateNotification,
  deleteNotification,
};
