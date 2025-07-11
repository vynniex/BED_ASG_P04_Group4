import { db } from '../../config/firebase.js'; 

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('medication-form');
  const backBtn = document.querySelector('.btn-back');
  
  // Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // get form values
    const medication = {
        medicineName: form.querySelector('#medicine-name').value.trim(),
        purpose: form.querySelector('#purpose').value.trim(),
        perDay: parseInt(form.querySelector('#times-per-day').value),
        foodTiming: form.querySelector('#food-timing').value,
        createdAt: new Date().toISOString()
    };

    // client-side validation
    const errors = [];
    if (!medication.medicineName) errors.push('Medicine name is required!');
    if (!medication.purpose) errors.push('Purpose is required!');
    if (isNaN(medication.perDay) || medication.perDay < 1) errors.push('Valid frequency is required!');
    if (!['before', 'after'].includes(medication.foodTiming)) errors.push('Please select a Food Timing option!');

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    try {
        // check if medicine already exists
        const medRef = doc(db, "medications", medication.medicineName);
        if ((await getDoc(medRef)).exists()) {
            alert('This medication already exists!')
            return;
        }
        
        // disable submit button
        const submitBtn = form.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';

        // save to firebase
        await setDoc(medRef, medication);

        alert('Medicine created successfully!');
        form.reset();
    } catch (error) {
        console.error('Save error:', error);
        alert('Failed to save. Please try again!');
    } finally {
        const submitBtn = form.querySelector('.btn-submit');
        submitBtn.disabled = false;
        submitBtn.textContent = 'DONE';
    }
  });

  // back button handler
  backBtn.addEventListener('click', () => {
    if (confirm('Discard this entry?')) {
        window.location.href = '../html/create-medicine.html'
    }
  });
});