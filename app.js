const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors")  // For API development
const path = require("path");

// Load environment variables
dotenv.config();

const medsController = require("./medicine-api-xinyi/controllers/medsController.js");
const {
  validateMedInput,
  validateMedName,
} = require("./medicine-api-xinyi/middlewares/medsValidation.js");

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

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Medication API: http://localhost:${port}/api/medications`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Server is gracefully shutting down");
  process.exit(0);
});