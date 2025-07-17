document.addEventListener('DOMContentLoaded', async () => {
    const editReminderForm = document.getElementById('editReminderForm');
    const reminderIdField = document.getElementById('reminderId');
    const reminderTypeSelect = document.getElementById('editReminderType');
    const reminderTitleInput = document.getElementById('editReminderTitle');
    const reminderDescriptionTextarea = document.getElementById('editReminderDescription');
    const reminderDateInput = document.getElementById('editReminderDate');
    const reminderTimeInput = document.getElementById('editReminderTime');
    const frequencyCheckboxes = document.querySelectorAll('input[name="frequency"]');

    const API_BASE_URL = 'http://localhost:3000/api/notifications'; // Your Notification API endpoint

    // Get reminder ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const reminderId = urlParams.get('id');

    if (!reminderId) {
        alert('No reminder ID found in URL. Cannot edit.');
        // --- CORRECTED REDIRECT PATH ---
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
            alert('Failed to load reminder data: ' + error.message);
            // --- CORRECTED REDIRECT PATH ---
            window.location.href = '../index.html'; // Redirect on error
        }
    }

    // --- Function to Fill Form Fields ---
    function fillFormWithData(reminder) {
        reminderIdField.value = reminder.id;
        reminderTypeSelect.value = reminder.reminderType || ''; // Use reminderType
        reminderTitleInput.value = reminder.reminderTitle || ''; // Use reminderTitle
        reminderDescriptionTextarea.value = reminder.description || '';
        reminderDateInput.value = reminder.date ? new Date(reminder.date).toISOString().split('T')[0] : ''; // Format date
        reminderTimeInput.value = reminder.time || '';

        // Set frequency checkboxes
        const reminderFrequencies = reminder.frequency || [];
        frequencyCheckboxes.forEach(checkbox => {
            checkbox.checked = reminderFrequencies.includes(checkbox.value);
        });
    }

    // --- Event Listener for Form Submission (Update) ---
    editReminderForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = reminderIdField.value;
        const type = reminderTypeSelect.value;
        const title = reminderTitleInput.value.trim();
        const description = reminderDescriptionTextarea.value.trim();
        const date = reminderDateInput.value;
        const time = reminderTimeInput.value;

        const frequencies = Array.from(document.querySelectorAll('input[name="frequency"]:checked'))
                               .map(cb => cb.value);

        // Basic validation
        if (!type || !title || !description || !date || !time) {
            alert('Please fill in all required fields (Reminder Type, Title, Description, Date, Time).');
            return;
        }

        const updatedData = {
            reminderType: type, // Use reminderType
            reminderTitle: title, // Use reminderTitle
            description: description,
            date: date,
            time: time,
            frequency: frequencies
            // Note: createdAt typically not updated
        };

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
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
            alert('Reminder updated successfully!');
            // --- CORRECTED REDIRECT PATH ---
            window.location.href = '../index.html'; // Redirect to home page
        } catch (error) {
            console.error('Error updating reminder:', error);
            alert('Failed to update reminder: ' + error.message);
        }
    });

    // Load data when page loads
    loadReminderData(reminderId);
});
