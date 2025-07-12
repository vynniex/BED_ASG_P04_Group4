const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', async () => {
  const medicineListEl = document.getElementById('medicine-list');

  if (!medicineListEl) return;

  try {
    const medsSnapshot = await db.collection('medications').get();

    if (medsSnapshot.empty) {
      medicineListEl.innerHTML = `<p>No medication records found.</p>`;
      return;
    }

    // Clear container
    medicineListEl.innerHTML = '';

    medsSnapshot.forEach(doc => {
      const med = doc.data();

      const medItem = document.createElement('div');
      medItem.classList.add('medication-item');
      medItem.innerHTML = `
        <h3>${med.medicineName}</h3>
        <p>Purpose: ${med.purpose}</p>
        <p>Times per day: ${med.perDay}</p>
        <p>Timing: ${med.foodTiming === 'before' ? 'Before Food' : 'After Food'}</p>
      `;

      medicineListEl.appendChild(medItem);
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    medicineListEl.innerHTML = `<p>Error loading medication records.</p>`;
  }
});