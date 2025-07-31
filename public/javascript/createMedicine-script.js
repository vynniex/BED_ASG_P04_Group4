const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('medication-form');
  const backBtn = document.querySelector('.btn-back');
  const submitBtn = form.querySelector('button[type="submit"]');

  const validateFormFields = () => {
    const name = form['medicineName'].value.trim();
    const purpose = form['purpose'].value.trim();
    const perDay = parseInt(form['perDay'].value);
    const foodTiming = form['foodTiming'].value;

    const isValid =
      name &&
      purpose &&
      !isNaN(perDay) &&
      perDay >= 1 &&
      ['before', 'after'].includes(foodTiming);

    submitBtn.disabled = !isValid;
  };

  ['medicineName', 'purpose', 'perDay', 'foodTiming'].forEach((id) => {
    form[id].addEventListener('input', validateFormFields);
    form[id].addEventListener('change', validateFormFields);
  });

  validateFormFields();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication error. Please log in again.');
      return;
    }

    const medData = {
      medicine_name: form['medicineName'].value.trim(),
      purpose: form['purpose'].value.trim(),
      per_day: parseInt(form['perDay'].value),
      food_timing: form['foodTiming'].value,
    };

    if (!medData.medicine_name || !medData.purpose || isNaN(medData.per_day)) {
        alert('Please fill out all fields correctly.');
        return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating...';

      const response = await fetch(`${API_BASE}/api/medications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(medData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown server error occurred.');
      }

      alert('Medicine created successfully!');
      window.location.href = 'medicine.html';

    } catch (error) {
      console.error('Database save error:', error);
      alert(`Save failed: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'DONE';
    }
  });

  backBtn.addEventListener('click', () => {
    if (confirm('Discard this entry?')) {
      window.location.href = 'medicine.html';
    }
  });
});