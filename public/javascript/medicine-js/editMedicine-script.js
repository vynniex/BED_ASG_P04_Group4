const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('medication-form');
    const backBtn = document.querySelector('.btn-back');
    const submitBtn = form.querySelector('button[type="submit"]');
    const pageTitle = document.querySelector('.medication-container h1');

    const urlParams = new URLSearchParams(window.location.search);
    const medId = urlParams.get('id');
    const token = localStorage.getItem('token');

    if (!medId || !token) {
        alert('Error: Missing ID or login token. Redirecting...');
        window.location.href = 'medicine.html';
        return;
    }

    // --- Fetch existing data ---
    try {
        const response = await fetch(`${API_BASE}/api/medications/id/${medId}`, {
             headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch medicine data.');
        
        const med = await response.json();
        pageTitle.textContent = `Edit Details for ${med.medicine_name}`;
        document.getElementById('medicine-name').value = med.medicine_name;
        document.getElementById('purpose').value = med.purpose;
        document.getElementById('times-per-day').value = med.per_day;
        document.getElementById('food-timing').value = med.food_timing;
    } catch (error) {
        alert(`Error loading data: ${error.message}`);
        window.location.href = 'medicine.html';
    }

    // --- Form submission handler ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // FIX: Include medicine_name in the data to be sent
        const updatedData = {
            medicine_name: document.getElementById('medicine-name').value.trim(),
            purpose: document.getElementById('purpose').value.trim(),
            per_day: parseInt(document.getElementById('times-per-day').value),
            food_timing: document.getElementById('food-timing').value,
        };

        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        try {
            // FIX: Use the medicine ID in the URL for the PUT request
            const response = await fetch(`${API_BASE}/api/medications/id/${medId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update medicine.');
            }

            alert('Medicine updated successfully!');
            window.location.href = 'medicine.html';
        } catch (error) {
            alert(`Update failed: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'DONE';
        }
    });

    backBtn.addEventListener('click', () => window.location.href = 'medicine.html');
});