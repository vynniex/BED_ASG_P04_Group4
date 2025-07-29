document.addEventListener('DOMContentLoaded', () => {
    const createReminderForm = document.getElementById('createReminderForm');
    const reminderDateInput = document.getElementById('reminderDate');
    const toastNotification = document.getElementById('toastNotification'); // Get the toast element

    // --- Function to display toast notifications ---
    function showToast(message, type = 'success') {
        toastNotification.textContent = message;
        toastNotification.className = `toast show ${type}`; // Add 'show' and type class
        setTimeout(() => {
            toastNotification.className = toastNotification.className.replace('show', ''); // Hide after 3 seconds
        }, 3000);
    }

    // --- Set minimum date for reminderDate input to today ---
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = today.getDate().toString().padStart(2, '0');
    const todayFormatted = `${year}-${month}-${day}`;
    reminderDateInput.setAttribute('min', todayFormatted);

    // --- API Base URL ---
    const API_BASE_URL = 'http://localhost:3000/api/reminders'; // Your Reminders API endpoint

    createReminderForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const reminderType = document.getElementById('reminderType').value;
        const reminderTitle = document.getElementById('reminderTitle').value.trim();
        const reminderDescription = document.getElementById('reminderDescription').value.trim();
        const reminderDate = document.getElementById('reminderDate').value;
        const reminderTime = document.getElementById('reminderTime').value;
        const timesPerDay = document.getElementById('timesPerDay').value; // Get new field value

        const selectedFrequencies = Array.from(document.querySelectorAll('input[name="frequency"]:checked'))
                                       .map(checkbox => checkbox.value);

        // --- Client-side validation ---
        if (!reminderType || !reminderTitle || !reminderDescription || !reminderDate || !reminderTime || !timesPerDay) {
            showToast('Please fill in all required fields (Reminder Type, Title, Description, Date, Time, Times per day).', 'error');
            return;
        }

        // Validate date is not in the past
        const selectedDateTime = new Date(`${reminderDate}T${reminderTime}`);
        if (selectedDateTime < today) {
            showToast('Reminder date and time cannot be in the past.', 'error');
            return;
        }

        // Validate timesPerDay
        const parsedTimesPerDay = parseInt(timesPerDay);
        if (isNaN(parsedTimesPerDay) || parsedTimesPerDay <= 0) {
            showToast('Times per day must be a positive number.', 'error');
            return;
        }

        const newReminderData = {
            type: reminderType, // Use 'type' as per your API structure
            reminderTitle: reminderTitle,
            description: reminderDescription,
            date: reminderDate,
            time: reminderTime,
            timesPerDay: parsedTimesPerDay, // Include new field
            frequency: selectedFrequencies,
            createdAt: new Date().toISOString() // Add creation timestamp
        };

        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newReminderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const createdReminder = await response.json();
            console.log('New Reminder Created:', createdReminder);
            showToast('Reminder created successfully!', 'success');
            createReminderForm.reset(); // Clear the form
            window.location.href = '../index.html'; // Redirect back to the home page
        } catch (error) {
            console.error('Error creating reminder:', error);
            showToast('Failed to create reminder: ' + error.message, 'error');
        }
    });
});
