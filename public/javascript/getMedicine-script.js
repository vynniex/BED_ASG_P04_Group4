const API_BASE = 'http://localhost:3000';

// change to based on token so if no token will show ur msg
document.addEventListener('DOMContentLoaded', async () => {
  const medicineListEl = document.getElementById('medicine-list');

  const token = localStorage.getItem('token');

  if (!token) {
    medicineListEl.innerHTML = `
      <div style="text-align:center; padding: 10px;">
        <p class="inter-regular">Please LOGIN or SIGNUP to view/add your medicines</p>
        <button id="login-redirect-btn" style="
          padding: 5px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        ">Go to Login</button>
      </div>
    `;

    document.getElementById('login-redirect-btn').addEventListener('click', () => {
      window.location.href = '../login.html';
    });

    return;
  }

  async function loadMedicines() {
    try {
      const response = await fetch(`${API_BASE}/api/medications`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch medicines');

      const meds = await response.json();

      if (!meds.length) {
        medicineListEl.innerHTML = `<p>No medication records found.</p>`;
        return;
      }

      medicineListEl.innerHTML = '';

      meds.forEach(med => {
        renderMedicineCard({
          id: med.medicine_id,
          medicineName: med.medicine_name,
          purpose: med.purpose,
          perDay: med.per_day,
          foodTiming: med.food_timing
        });
      });
    } catch (error) {
      medicineListEl.innerHTML = `
        <div class="error-message">
          Failed to load medicines.<br>${error.message}
        </div>
      `;
      console.error(error);
    }
  }

  function renderMedicineCard(med) {
    const medItem = document.createElement('div');
    medItem.classList.add('medicine-card');
    medItem.dataset.id = med.id;

    const foodTimingText = med.foodTiming
      ? med.foodTiming.charAt(0).toUpperCase() + med.foodTiming.slice(1)
      : 'Not specified';

    medItem.innerHTML = `
      <div class="medicine-info">
        <h2><b>${med.medicineName}</b></h2>
        <p><b>For:</b> ${med.purpose}</p>
        <p><b>Times/day:</b> ${med.perDay}</p>
        <p><b>B/A:</b> ${foodTimingText}</p>
      </div>
      <div class="medicine-actions">
        <button class="btn-edit">EDIT</button>
        <button class="btn-remove">REMOVE</button>
      </div>
    `;

    medItem.querySelector('.btn-remove').addEventListener('click', async () => {
      try {
        const confirmed = confirm(`Are you sure you want to remove ${med.medicineName}?`);
        if (!confirmed) return;

        const res = await fetch(`${API_BASE}/api/medications/id/${encodeURIComponent(med.id)}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete medicine');

        medItem.remove();

        if (!medicineListEl.querySelector('.medicine-card')) {
          medicineListEl.innerHTML = `<p>No medication records found.</p>`;
        }
      } catch (error) {
        console.error('Removal failed:', error);
        alert(`Removal of ${med.medicineName} failed`);
      }
    });

    medicineListEl.appendChild(medItem);
  }

  loadMedicines();

  document.querySelector('.btn-add')?.addEventListener('click', () => {
    window.location.href = 'create-medicine.html';
  });
});