const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors")  // For API development
const path = require("path");
const sql = require("mssql");

// Load environment variables
dotenv.config();

const medsController = require("./medicine-api-xinyi/controllers/medsController.js");
const { validateMedInput, validateMedName } = require("./medicine-api-xinyi/middlewares/medsValidation.js");

const apptController = require("./appointments-api-grace/controllers/apptsController.js");
const {verifyJWT, validateAppt, validateLogin } = require("./appointments-api-grace/middlewares/apptsValidation.js");

const recsController = require("./records-api-xuening/controllers/recsController");
const { validateRecord } = require("./records-api-xuening/middlewares/recsValidation");

const notifsController = require("./notifs-api-dalton/controllers/notifsController.js");
const { validateNotif } = require("./notifs-api-dalton/middlewares/notifsValidation.js");


// Create express app
const app = express();
const port = process.env.PORT || 3000;

// Middlewares (Parsing request bodies)
app.use(cors());  // For Frontend connections
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, "public"))); // Static files

// ================= Routes ====================
// MEDICATION ROUTES - XY
app.post("/api/medications", validateMedInput, medsController.createMed);
app.get("/api/medications", medsController.getAllMeds);
app.get("/api/medications/:medName", validateMedName, medsController.getMedByName);
app.put("/api/medications/:medName", validateMedName, validateMedInput, medsController.updateMed);
app.delete("/api/medications/:medName", validateMedName, medsController.deleteMed);

// APPOINTMENT ROUTES - Grace
app.get("/api/appointments/login/users", verifyJWT, apptController.getAllAppointmentsByUser);
app.post("/api/appointments", validateAppt, apptController.createAppointment);
app.put("/api/appointments/:id", apptController.updateAppointmentById);
app.post("/api/appointments/login", validateLogin, apptController.loginUser);
app.delete("/api/appointments/:id", apptController.deleteAppointmentById);

// MEDICAL RECORDS ROUTES - XN
app.get("/api/records", recsController.getAllRecords);
app.get("/api/records/:id", recsController.getRecordById);
app.post("/api/records", validateRecord, recsController.createRecord);
app.put("/api/records/:id", validateRecord, recsController.updateRecordById);
app.delete("/api/records/:id", recsController.deleteRecordById);

// NOTIFICATION ROUTES - Dalton
app.post("/api/notifications", validateNotif, notifsController.createNotification);
app.get("/api/notifications", notifsController.getAllNotifications);
app.get("/api/notifications/:id", notifsController.getNotificationById); // 
app.put("/api/notifications/:id", validateNotif, notifsController.updateNotification);
app.delete("/api/notifications/:id", notifsController.deleteNotification);


// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Medication API: http://localhost:${port}/api/medications`);
  console.log(`Medical Records API: http://localhost:${port}/api/records`);
  console.log(`Appointment API: http://localhost:${port}/api/appointments/users/{nric}/{fullName}`);
  console.log(`Replace {nric} and {fullName} with user details`);
  console.log(`Notification API: http://localhost:${port}/api/notifications`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Server is gracefully shutting down");
  process.exit(0);
});