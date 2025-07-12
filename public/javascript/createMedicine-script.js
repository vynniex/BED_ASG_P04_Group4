const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('medication-form');
  const backBtn = document.querySelector('.btn-back');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Live validation function to enable/disable submit button
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

  // Attach validation to input events
  ['medicineName', 'purpose', 'perDay', 'foodTiming'].forEach((id) => {
    form[id].addEventListener('input', validateFormFields);
    form[id].addEventListener('change', validateFormFields);
  });

  // Initial validation on page load
  validateFormFields();

  // Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // get form values
    const medication = {
      medicineName: form['medicineName'].value.trim(),
      purpose: form['purpose'].value.trim(),
      perDay: parseInt(form['perDay'].value),
      foodTiming: form['foodTiming'].value,
      createdAt: new Date().toISOString()
    };

    // client-side validation (fallback)
    const errors = [];
    if (!medication.medicineName) errors.push('Medicine name is required!');
    if (!medication.purpose) errors.push('Purpose is required!');
    if (isNaN(medication.perDay)) errors.push('Valid frequency is required!');
    if (medication.perDay < 1) errors.push('Times per day must be at least 1!');
    if (!['before', 'after'].includes(medication.foodTiming)) errors.push('Please select before / after food!');

    if (errors.length > 0) {
      alert(`Please fix these errors:\n${errors.join('\n')}`);
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating...';

      // check if medicine already exists
      const medRef = db.collection("medications").doc(medication.medicineName);
      const docSnap = await medRef.get();

      if (docSnap.exists) {
        alert('This medicine already exists!');
        submitBtn.disabled = false;
        submitBtn.textContent = 'DONE';
        return;
      }

      // save new medicine to firebase
      await medRef.set(medication);

      alert('Medicine created successfully!');
      window.location.href = 'medicine.html'; // redirects after success

    } catch (error) {
      console.error('Database save error:', error);
      alert(`Save failed: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'DONE';
    }
  });

  // back button handler
  backBtn.addEventListener('click', () => {
    if (confirm('Discard this entry?')) {
      window.location.href = 'medicine.html';
    }
  });
});