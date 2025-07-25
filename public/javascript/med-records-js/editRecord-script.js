// editRecord-script.js

// Get recordId from URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const recordId = urlParams.get("id");

if (!recordId) {
  alert("No record ID provided in URL.");
  throw new Error("Missing record ID");
}

function convertDateToDDMMYYYY(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
}

// Fetch record data and populate form
fetch(`http://localhost:3000/api/records/${recordId}`)
  .then(res => {
    if (!res.ok) throw new Error("Failed to load record");
    return res.json();
  })
  .then(data => {
    document.getElementById("recordId").value = data.recordId;
    document.getElementById("userId").value = data.userId;
    document.getElementById("date").value = data.date.split("T")[0];
    document.getElementById("doctorName").value = data.doctorName || "";
    document.getElementById("diagnosis").value = data.diagnosis || "";
    document.getElementById("notes").value = data.notes || "";
    document.getElementById("systolic").value = data.systolic ?? "";
    document.getElementById("diastolic").value = data.diastolic ?? "";
    document.getElementById("bloodSugar").value = data.bloodSugar ?? "";
    document.getElementById("weight").value = data.weight ?? "";
  })
  .catch(err => {
    console.error(err);
    alert("Failed to load record.");
  });

// Handle form submission
document.getElementById("record-form").addEventListener("submit", function(e) {
  e.preventDefault();

  // Get the date value from input (YYYY-MM-DD)
  const inputDate = document.getElementById("date").value;

  // Convert to DD-MM-YYYY format
  const formattedDate = convertDateToDDMMYYYY(inputDate);

  const updatedRecord = {
    userId: parseInt(document.getElementById("userId").value),
    date: formattedDate,
    doctorName: document.getElementById("doctorName").value,
    diagnosis: document.getElementById("diagnosis").value,
    notes: document.getElementById("notes").value,
    systolic: document.getElementById("systolic").value ? parseInt(document.getElementById("systolic").value) : null,
    diastolic: document.getElementById("diastolic").value ? parseInt(document.getElementById("diastolic").value) : null,
    bloodSugar: document.getElementById("bloodSugar").value ? parseFloat(document.getElementById("bloodSugar").value) : null,
    weight: document.getElementById("weight").value ? parseFloat(document.getElementById("weight").value) : null,
  };

  fetch(`http://localhost:3000/api/records/${recordId}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(updatedRecord)
  })
  .then(async (res) => {
    if (!res.ok) {
      // Try to parse JSON error message from response
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.error || errorBody.message || "Update failed");
    }
    return res.json();
  })
  .then(() => {
    alert("Record updated successfully!");
    window.location.href = "records.html";
  })
  .catch(err => {
    console.error("Update error:", err);
    alert("Failed to update record: " + err.message);
  });

});
