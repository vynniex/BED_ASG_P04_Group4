const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', async () => {
  const medicineListEl = document.getElementById('medicine-list');

  if (!medicineListEl) return;

  try {
    const medsSnapshot = await db.collection('medications').get();

    if (medsSnapshot.empty) {
      medicineListEl.innerHTML = `<p>No medicine records</p>`;
      return;
    }

    // Clear container
    medicineListEl.innerHTML = '';

    medsSnapshot.forEach(docSnap => {
      const med = docSnap.data();
      const docId = docSnap.id;

      const medItem = document.createElement('div');
      medItem.classList.add('medicine-card');

      const foodTimingText = med.foodTiming
        ? med.foodTiming.charAt(0).toUpperCase() + med.foodTiming.slice(1)
        : 'N/A';
      
      medItem.innerHTML = `
        <div class="medicine-info">
          <h2 class="inter-regular"><u><b>${med.medicineName}</b></u></h2>
          <p class="inter-regular"><b>For:</b> ${med.purpose}</p>
          <p class="inter-regular"><b>Times / day:</b> ${med.perDay}</p>
          <p class="inter-regular"><b>B/A:</b> ${foodTimingText}</p>
        </div>
        <div class="medicine-actions">
          <button class="btn-edit inter-regular">EDIT</button>
          <button class="btn-remove inter-regular">REMOVE</button>
        </div>
      `;

      // Edit button (you can later replace this with actual edit logic)
      medItem.querySelector('.btn-edit').addEventListener('click', () => {
        alert(`Edit not implemented yet!`);
      });

      // Remove button
      medItem.querySelector('.btn-remove').addEventListener('click', async () => {
        const confirmDelete = confirm(`Confirm removal of ${med.medicineName}?`);
        if (!confirmDelete) return;

        try {
          await db.collection('medications').doc(docId).delete();
          medItem.remove();
          alert(`${med.medicineName} successfully removed!`);
        } catch (err) {
          console.error('Failed to remove:', err);
          alert(`Failed to remove: ${med.medicineName}`);
        }
      });

      medicineListEl.appendChild(medItem);
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    medicineListEl.innerHTML = `<p>Error loading medication records.</p>`;
  }
});