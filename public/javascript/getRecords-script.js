document.addEventListener("DOMContentLoaded", async () => {
  const recordsList = document.getElementById("records-list");
  const emptyState = document.querySelector(".record-empty-state");

  try {
    const response = await fetch("http://localhost:3000/api/records");
    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }
    const records = await response.json();

    // Check if medical records exist in database 
    if (records.length === 0) {
      emptyState.style.display = "block";
      recordsList.style.display = "none";
    } else {
      emptyState.style.display = "none";
      recordsList.style.display = "block";

      let html = '<ul class="records-ul">';
      records.forEach(record => {
        const dateStr = record.date?.seconds
          ? new Date(record.date.seconds * 1000).toLocaleDateString()
          : "Invalid Date";

        html += `
          <li class="record-item inter-regular">
            <strong>Date:</strong> ${dateStr}<br/>
            <strong>Feeling:</strong> ${record.feeling}<br/>
            <strong>Blood Pressure:</strong> ${record.systolic}/${record.diastolic} mmHg<br/>
            <strong>Blood Sugar:</strong> ${record.bloodSugar} mg/dL<br/>
            <strong>Weight:</strong> ${record.weight} kg<br/>
            <button class="btn-edit" data-id="${record.id}">Edit</button>
            <button class="btn-delete" data-id="${record.id}">Delete</button>
          </li><br/>
        `;
      });
      html += "</ul>";
      recordsList.innerHTML = html;

      // Add event listeners for Delete buttons
      document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          if (confirm("Are you sure you want to delete this record?")) {
            try {
              const delRes = await fetch(`http://localhost:3000/api/records/${id}`, {
                method: "DELETE"
              });
              if (!delRes.ok) throw new Error("Failed to delete record");
              alert("Record has been deleted successfully.");
              location.reload(); // Refresh page
            } catch (err) {
              alert("Error deleting record: " + err.message);
            }
          }
        });
      });

      // Add event listeners for Edit buttons
      document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = e.target.dataset.id;
          window.location.href = `edit-record.html?id=${encodeURIComponent(id)}`;
        });
      });
    }
  } catch (error) {
    console.error("Failed to fetch records:", error);
    emptyState.innerHTML = `<h2 class="inter-regular">Error loading medical records. Please try again later.</h2>`;
    emptyState.style.display = "block";
    recordsList.style.display = "none";
  }
});
