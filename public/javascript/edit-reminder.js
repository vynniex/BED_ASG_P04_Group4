document.addEventListener('DOMContentLoaded', async () => {
    const editReminderForm = document.getElementById('editReminderForm');
    // Corrected element IDs to match editreminders.html
    const reminderIdField = document.getElementById('reminderId'); // Added to get the hidden ID field
    const reminderTypeInput = document.getElementById('editReminderType');
    const reminderTitleInput = document.getElementById('editReminderTitle');
    const reminderDescriptionTextarea = document.getElementById('editReminderDescription');
    const reminderDateInput = document.getElementById('editReminderDate');
    const reminderTimeInput = document.getElementById('editReminderTime');
    const timesPerDayInput = document.getElementById('timesPerDay'); // This ID already matches HTML
    const frequencyCheckboxes = document.querySelectorAll('input[name="frequency"]'); // Targets by name, which is correct
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

    // Get reminder ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const reminderId = urlParams.get('id');

    if (!reminderId) {
        showToast('No reminder ID found in URL. Cannot edit.', 'error');
        window.location.href = '../index.html'; // Redirect if no ID
        return;
    }

    // --- Function to Load Reminder Data ---
    async function loadReminderData(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Reminder not found.');
                }
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
            }
            const reminder = await response.json();
            fillFormWithData(reminder);
        } catch (error) {
            console.error('Error loading reminder data:', error);
            showToast('Failed to load reminder data: ' + error.message, 'error');
            window.location.href = '../index.html'; // Redirect on error
        }
    }

    // --- Function to Fill Form Fields ---
    function fillFormWithData(reminder) {
        // Populate form fields
        reminderIdField.value = reminder.id || ''; // Set the hidden ID field
        reminderTypeInput.value = reminder.type || ''; // Use 'type' as per your API structure
        reminderTitleInput.value = reminder.reminderTitle || '';
        reminderDescriptionTextarea.value = reminder.description || '';
        reminderDateInput.value = reminder.date || '';
        reminderTimeInput.value = reminder.time || '';
        timesPerDayInput.value = reminder.timesPerDay || 1; // Populate new field, default to 1

        // Set frequency checkboxes
        const reminderFrequencies = reminder.frequency || [];
        frequencyCheckboxes.forEach(checkbox => {
            checkbox.checked = reminderFrequencies.includes(checkbox.value);
        });
    }

    // --- Event Listener for Form Submission (Update) ---
    editReminderForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = reminderIdField.value; // Get ID from hidden field
        const type = reminderTypeInput.value;
        const title = reminderTitleInput.value.trim();
        const description = reminderDescriptionTextarea.value.trim();
        const date = reminderDateInput.value;
        const time = reminderTimeInput.value;
        const timesPerDay = timesPerDayInput.value; // Get new field value

        const frequencies = Array.from(document.querySelectorAll('input[name="frequency"]:checked'))
                               .map(cb => cb.value);

        // Basic validation
        if (!type || !title || !date || !time || !timesPerDay) {
            showToast('Please fill in all required fields (Reminder Type, Title, Date, Time, Times per day).', 'error');
            return;
        }

        // Validate date is not in the past
        const selectedDateTime = new Date(`${date}T${time}`);
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

        const updatedData = {
            type: type, // Use 'type' as per your API structure
            reminderTitle: title,
            description: description,
            date: date,
            time: time,
            timesPerDay: parsedTimesPerDay, // Include new field
            frequency: frequencies
            // Note: createdAt typically not updated
        };

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, { // Use ID from hidden field
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const updatedReminder = await response.json();
            console.log('Reminder updated:', updatedReminder);
            showToast('Reminder updated successfully!', 'success');
            window.location.href = '../index.html'; // Redirect to home page
        } catch (error) {
            console.error('Error updating reminder:', error);
            showToast('Failed to update reminder: ' + error.message, 'error');
        }
    });

    // Load data when page loads
    loadReminderData(reminderId);
});
