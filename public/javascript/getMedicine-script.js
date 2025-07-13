document.addEventListener('DOMContentLoaded', async () => {
  const db = firebase.firestore();
  
  const medicineListEl = document.getElementById('medicine-list');
  const modal = document.getElementById('confirmation-modal');
  const modalMessage = document.getElementById('modal-message');
  const modalCancel = document.getElementById('modal-cancel');
  const modalConfirm = document.getElementById('modal-confirm');

  // load meds from firebase
  async function loadMedicines() {
    try {
      const querySnapshot = await db.collection("medications").get();
      
      if (querySnapshot.empty) {
        medicineListEl.innerHTML = `<p class="inter-regular">No medication records</p>`;
        return;
      }

      medicineListEl.innerHTML = '';
      
      querySnapshot.forEach(doc => {
        const med = doc.data();
        renderMedicineCard({
          id: doc.id,
          medicineName: med.medicineName || 'Unnamed Medication',
          purpose: med.purpose || 'Not specified',
          perDay: med.perDay || 0,
          foodTiming: med.foodTiming || 'not specified'
        });
      });

    } catch (error) {
      medicineListEl.innerHTML = `
        <div class="error-message inter-regular">
          Failed to load medicines
          <br>${error.message}
        </div>
      `;
    }
  }

  // render individual med cards
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

    // rmv button
    medItem.querySelector('.btn-remove').addEventListener('click', () => {
      showConfirmationModal(
        `Are you sure you want to remove ${med.medicineName}?`,
        async () => {
          try {
            await db.collection("medications").doc(med.id).delete();
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

  // cfm modal
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

  // toast notif
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

  // add button
  document.querySelector('.btn-add')?.addEventListener('click', () => {
    window.location.href = 'create-medicine.html';
  });
});