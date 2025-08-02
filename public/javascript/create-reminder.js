document.addEventListener('DOMContentLoaded', () => {
    const createReminderForm = document.getElementById('createReminderForm');
    const reminderDateInput = document.getElementById('reminderDate');
    const toastNotification = document.getElementById('toastNotification');
    const timesPerDayInput = document.getElementById('timesPerDay');
    const timeInputsWrapper = document.getElementById('timeInputsWrapper');

    // --- Function to display toast notifications ---
    function showToast(message, type = 'error') {
        toastNotification.textContent = message;
        toastNotification.className = `toast show ${type}`;
        setTimeout(() => {
            toastNotification.className = toastNotification.className.replace('show', '');
        }, 3000);
    }

    // --- Function to generate time input fields ---
    function generateTimeInputs(count) {
        timeInputsWrapper.innerHTML = ''; // Clear previous inputs
        if (count > 0) {
            const container = document.createElement('div');
            for (let i = 1; i <= count; i++) {
                const timeInputGroup = document.createElement('div');
                timeInputGroup.className = 'form-group-inline';

                const label = document.createElement('label');
                label.setAttribute('for', `reminderTime${i}`);
                label.textContent = `Time ${i}:`;

                const input = document.createElement('input');
                input.type = 'time';
                input.id = `reminderTime${i}`;
                input.className = 'reminder-time-input'; // Class for easy selection
                input.required = true;

                timeInputGroup.appendChild(label);
                timeInputGroup.appendChild(input);
                container.appendChild(timeInputGroup);
            }
            timeInputsWrapper.appendChild(container);
        }
    }
    
    // --- Set minimum date for reminderDate input to today ---
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const todayFormatted = `${year}-${month}-${day}`;
    reminderDateInput.setAttribute('min', todayFormatted);

    // --- API Base URL ---
    const API_BASE_URL = 'http://localhost:3000/api/notifications';

    // --- Event Listener for Times Per Day change ---
    timesPerDayInput.addEventListener('input', (event) => {
        const count = parseInt(event.target.value, 10) || 0;
        generateTimeInputs(count);
    });

    // --- Initial generation of time inputs ---
    generateTimeInputs(parseInt(timesPerDayInput.value, 10));

    // --- Form Submission Logic ---
    createReminderForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const reminderType = document.getElementById('reminderType').value;
        const reminderTitle = document.getElementById('reminderTitle').value.trim();
        const reminderDescription = document.getElementById('reminderDescription').value.trim();
        const reminderDate = reminderDateInput.value;
        const timesPerDay = timesPerDayInput.value;

        // Collect all time values from the dynamic inputs
        const timeInputs = document.querySelectorAll('.reminder-time-input');
        const reminderTimes = Array.from(timeInputs).map(input => input.value);
        
        const selectedFrequencies = Array.from(document.querySelectorAll('input[name="frequency"]:checked'))
                                       .map(checkbox => checkbox.value);

        // --- Client-side validation ---
        if (!reminderType || !reminderTitle || !reminderDate || !timesPerDay) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }
        if (reminderTimes.some(time => !time)) {
            showToast('Please fill in all time fields.', 'error');
            return;
        }

        const newReminderData = {
            reminderType: reminderType,
            reminderTitle: reminderTitle,
            description: reminderDescription,
            date: reminderDate,
            reminderTimes: reminderTimes, // Use the array of times
            timesPerDay: parseInt(timesPerDay, 10),
            frequency: selectedFrequencies,
        };

        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReminderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            showToast('Reminder created successfully!', 'success');
            createReminderForm.reset();
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Error creating reminder:', error);
            showToast('Failed to create reminder: ' + error.message, 'error');
        }
    });
});
