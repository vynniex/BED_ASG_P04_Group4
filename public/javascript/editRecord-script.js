document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const recordId = urlParams.get("id");

  if (!recordId) {
    alert("Missing record ID.");
    window.location.href = "records.html";
    return;
  }

  const feelingInput = document.getElementById("feeling");
  const feelingButtons = document.querySelectorAll(".feeling-btn");

  try {
    const res = await fetch(`http://localhost:3000/api/records`);
    const allRecords = await res.json();
    const record = allRecords.find(r => r.id === recordId);

    if (!record) {
      alert("Record not found.");
      window.location.href = "records.html";
      return;
    }

    // Prefill form values
    document.getElementById("record-date").value = new Date(record.date.seconds * 1000).toISOString().split("T")[0];
    document.getElementById("systolic").value = record.systolic;
    document.getElementById("diastolic").value = record.diastolic;
    document.getElementById("blood-sugar").value = record.bloodSugar;
    document.getElementById("weight").value = record.weight;
    feelingInput.value = record.feeling;

    // Highlight selected feeling button
    feelingButtons.forEach(btn => {
      if (btn.dataset.value === record.feeling) btn.classList.add("selected");
    });

    // Button toggle logic
    feelingButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        feelingButtons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        feelingInput.value = btn.dataset.value;
      });
    });

    // Handle form submission
    document.getElementById("record-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const updatedRecord = {
        date: document.getElementById("record-date").value,
        feeling: feelingInput.value,
        systolic: parseInt(document.getElementById("systolic").value),
        diastolic: parseInt(document.getElementById("diastolic").value),
        bloodSugar: parseInt(document.getElementById("blood-sugar").value),
        weight: parseFloat(document.getElementById("weight").value),
      };

      const updateRes = await fetch(`http://localhost:3000/api/records/${recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecord),
      });

      // Notify if medical record is edited successfully
      if (updateRes.ok) {
        alert('Medical record has been edited.');
        window.location.href = "records.html";
      } else {
        const error = await updateRes.json();
        alert(`Error updating record: ${error.error}`);
      }
    });

  } catch (error) {
    console.error("Error loading record:", error);
    alert("Failed to load record.");
  }
});
