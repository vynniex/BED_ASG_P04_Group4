// createRecord-script.js

function convertDateToDDMMYYYY(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
}

document.getElementById("record-form").addEventListener("submit", function(e) {
  e.preventDefault();

  // Get the date value from input (YYYY-MM-DD)
  const inputDate = document.getElementById("date").value;

  // Convert to DD-MM-YYYY format
  const formattedDate = convertDateToDDMMYYYY(inputDate);

  const newRecord = {
    userId: parseInt(document.getElementById("userId").value), // Assuming userId input exists and is filled
    date: formattedDate,
    doctorName: document.getElementById("doctorName").value,
    diagnosis: document.getElementById("diagnosis").value,
    notes: document.getElementById("notes").value,
    systolic: document.getElementById("systolic").value ? parseInt(document.getElementById("systolic").value) : null,
    diastolic: document.getElementById("diastolic").value ? parseInt(document.getElementById("diastolic").value) : null,
    bloodSugar: document.getElementById("bloodSugar").value ? parseFloat(document.getElementById("bloodSugar").value) : null,
    weight: document.getElementById("weight").value ? parseFloat(document.getElementById("weight").value) : null,
  };

  fetch("http://localhost:3000/api/records", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newRecord)
  })
  .then(async (res) => {
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.error || errorBody.message || "Create failed");
    }
    return res.json();
  })
  .then(() => {
    alert("Record created successfully!");
    window.location.href = "records.html";  // Redirect after creation
  })
  .catch(err => {
    console.error("Create error:", err);
    alert("Failed to create record: " + err.message);
  });
});
