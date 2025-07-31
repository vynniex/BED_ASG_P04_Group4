const API_BASE = 'http://localhost:3000';

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
            medicineListEl.innerHTML = `<div class="error-message">Failed to load medicines.<br>${error.message}</div>`;
            console.error(error);
        }
    }

    function renderMedicineCard(med) {
        const medItem = document.createElement('div');
        medItem.classList.add('medicine-card');
        medItem.dataset.id = med.id;

        const foodTimingText = med.foodTiming ? med.foodTiming.charAt(0).toUpperCase() + med.foodTiming.slice(1) : 'Not specified';

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

        medItem.querySelector('.btn-remove').addEventListener('click', () => {
            const modal = document.getElementById('confirmation-modal');
            const modalMessage = document.getElementById('modal-message');
            const confirmBtn = document.getElementById('modal-confirm');
            const cancelBtn = document.getElementById('modal-cancel');

            modalMessage.textContent = `Are you sure you want to remove ${med.medicineName}?`;
            modal.style.display = 'block';
            document.body.classList.add('modal-open');

            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

            const hideModal = () => {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            };

            newConfirmBtn.onclick = async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/medications/id/${encodeURIComponent(med.id)}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.error || `Failed to delete ${med.medicineName}`);
                    }
                    
                    medItem.remove();
                    showToast(`${med.medicineName} removed successfully!`, 'success');

                } catch (error) {
                    console.error('Removal failed:', error);
                    showToast(error.message, 'error');
                } finally {
                    hideModal();
                }
            };

            cancelBtn.onclick = () => {
                hideModal();
            };
        });

        medicineListEl.appendChild(medItem);
    }

    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`; // e.g., 'toast success'
        toast.textContent = message;
        
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }

    loadMedicines();

    document.querySelector('.btn-add')?.addEventListener('click', () => {
        window.location.href = 'create-medicine.html';
    });
});