document.addEventListener('DOMContentLoaded', async () => {
  const medicineListEl = document.getElementById('medicine-list');
  const modal = document.getElementById('confirmation-modal');
  const modalMessage = document.getElementById('modal-message');
  const modalCancel = document.getElementById('modal-cancel');
  const modalConfirm = document.getElementById('modal-confirm');

  async function loadMedicines() {
    try {
      const response = await fetch('/api/medications');
      if (!response.ok) throw new Error('Failed to fetch medicines');

      const meds = await response.json();

      if (!meds.length) {
        medicineListEl.innerHTML = `<p class="inter-regular">No medication records</p>`;
        return;
      }

      medicineListEl.innerHTML = '';

      meds.forEach(med => {
        renderMedicineCard({
          id: med.medicineName,
          medicineName: med.medicineName,
          purpose: med.purpose,
          perDay: med.perDay,
          foodTiming: med.foodTiming
        });
      });
    } catch (error) {
      medicineListEl.innerHTML = `
        <div class="error-message inter-regular">
          Failed to load medicines<br>${error.message}
        </div>
      `;
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
        <h2 class="inter-regular"><u><b>${med.medicineName}</b></u></h2>
        <p class="inter-regular"><b>For:</b> ${med.purpose}</p>
        <p class="inter-regular"><b>Times/day:</b> ${med.perDay}</p>
        <p class="inter-regular"><b>B/A:</b> ${foodTimingText}</p>
      </div>
      <div class="medicine-actions">
        <button class="btn-edit inter-regular">EDIT</button>
        <button class="btn-remove inter-regular">REMOVE</button>
      </div>
    `;

    medItem.querySelector('.btn-remove').addEventListener('click', () => {
      showConfirmationModal(
        `Are you sure you want to remove ${med.medicineName}?`,
        async () => {
          try {
            const res = await fetch(`/api/medications/${encodeURIComponent(med.id)}`, {
              method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete medicine');

            medItem.remove();
            showToast(`${med.medicineName} successfully removed!`, 'success');
          } catch (error) {
            console.error('Removal failed:', error);
            showToast(`Removal of ${med.medicineName} failed`, 'error');
          }
        }
      );
    });

    medicineListEl.appendChild(medItem);
  }

  function showConfirmationModal(message, confirmCallback) {
    document.body.classList.add('modal-open');
    modalMessage.textContent = message;
    modal.style.display = 'flex';

    const cleanUp = () => {
      document.body.classList.remove('modal-open');
      modalConfirm.onclick = null;
      modalCancel.onclick = null;
      modal.style.display = 'none';
    };

    modalConfirm.onclick = () => {
      confirmCallback();
      cleanUp();
    };

    modalCancel.onclick = cleanUp;
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.getElementById('toast-container').appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  loadMedicines();

  document.querySelector('.btn-add')?.addEventListener('click', () => {
    window.location.href = 'create-medicine.html';
  });
});