document.addEventListener("DOMContentLoaded", async () => {
  const recordsList = document.getElementById("records-list");
  const emptyState = document.querySelector(".record-empty-state");

  try {
    const response = await fetch("http://localhost:3000/api/records");
    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }
    const records = await response.json();

    if (records.length === 0) {
      emptyState.style.display = "block";
      recordsList.style.display = "none";
    } else {
      emptyState.style.display = "none";
      recordsList.style.display = "block";
      recordsList.innerHTML = ""; // clear before appending

      records.forEach(record => {
        const recordCard = createRecordCard(record);
        recordsList.appendChild(recordCard);
      });

      // Add event listeners for delete buttons
      document.querySelectorAll(".btn-remove").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.closest('.record-card').dataset.id;
          if (confirm("Are you sure you want to delete this record?")) {
            try {
              const delRes = await fetch(`http://localhost:3000/api/records/${id}`, {
                method: "DELETE"
              });
              if (!delRes.ok) throw new Error("Failed to delete record");
              alert("Record has been deleted successfully.");
              location.reload();
            } catch (err) {
              alert("Error deleting record: " + err.message);
            }
          }
        });
      });

      // Add event listeners for edit buttons
      document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = e.target.closest('.record-card').dataset.id;
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

function createRecordCard(record) {
  const card = document.createElement('div');
  card.classList.add('record-card');
  card.dataset.id = record.recordId || record.id;

  const dateStr = record.date ? new Date(record.date).toLocaleDateString() : 'Invalid Date';
  const systolic = record.systolic || '-';
  const diastolic = record.diastolic || '-';
  const bloodSugar = record.bloodSugar || '-';
  const weight = record.weight || '-';

  card.innerHTML = `
    <div class="record-info">
      <h2 class="inter-regular"><u><b>${dateStr}</b></u></h2>
      <p class="inter-regular"><b>Blood Pressure:</b> ${systolic} / ${diastolic} mmHg</p>
      <p class="inter-regular"><b>Blood Sugar:</b> ${bloodSugar} mg/dL</p>
      <p class="inter-regular"><b>Weight:</b> ${weight} kg</p>
      <p class="inter-regular"><b>Doctor:</b> ${record.doctorName || '-'}</p>
      <p class="inter-regular"><b>Diagnosis:</b> ${record.diagnosis || '-'}</p>
      <p class="inter-regular"><b>Notes:</b> ${record.notes || '-'}</p>
    </div>
    <div class="record-actions">
      <button class="btn-edit inter-regular">EDIT</button>
      <button class="btn-remove inter-regular">REMOVE</button>
    </div>
  `;

  return card;
}
