const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors")  // For API development

// Load environment variables
dotenv.config();

// Import Routes
const medsController = require("./medicine-api-xinyi/controllers/medsController.js")
const recsController = require("./records-api-xuening/controllers/recsController");

const app = express();
const port = process.env.PORT || 3000;

// Middlewares (Parsing request bodies)
app.use(cors());  // For Frontend connections
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, "public"))); // Static files

// Routes
// MEDICATION ROUTES - XY
app.post("/api/medications", medsController.createMed);
app.get("/api/medications", medsController.getAllMeds);
app.get("/api/medications/:medName", medsController.getMedByName);
app.put("/api/medications/:medName", medsController.updateMed);
app.delete("/api/medications/:medName", medsController.deleteMed);

// MEDICAL RECORDS ROUTES - XN (validation tba)
app.get("/api/records", recsController.getAllRecords);
app.post("/api/records", recsController.createRecord);
app.put("/api/records/:id", recsController.updateRecordById);
app.delete("/api/records/:id", recsController.deleteRecordById);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found" 
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Internal server error" 
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Medication API: http://localhost:${port}/api/medications`);
  console.log(`Medical Records API: http://localhost:${port}/api/records`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Server is gracefully shutting down");
  process.exit(0);
});