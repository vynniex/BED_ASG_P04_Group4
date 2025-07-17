document.addEventListener('DOMContentLoaded', () => {
    const createReminderForm = document.getElementById('createReminderForm');
    const API_BASE_URL = 'http://localhost:3000/api/notifications'; // Your Notification API endpoint

    createReminderForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const reminderType = document.getElementById('reminderType').value;
        const reminderTitle = document.getElementById('reminderTitle').value.trim();
        const reminderDescription = document.getElementById('reminderDescription').value.trim(); // Get trimmed value
        const reminderDate = document.getElementById('reminderDate').value;
        const reminderTime = document.getElementById('reminderTime').value;

        // Get selected frequencies
        const frequencies = Array.from(document.querySelectorAll('input[name="frequency"]:checked'))
                               .map(cb => cb.value);

        // --- Client-side validation ---
        if (!reminderType || !reminderTitle || !reminderDescription || !reminderDate || !reminderTime) {
            alert('Please fill in all required fields (Reminder Type, Title, Description, Date, Time).');
            return;
        }

        // Construct the data payload
        const reminderData = {
            reminderType: reminderType,
            reminderTitle: reminderTitle,
            description: reminderDescription,
            date: reminderDate,
            time: reminderTime,
            frequency: frequencies,
            createdAt: new Date().toISOString() // Add creation timestamp
        };

        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reminderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || JSON.stringify(errorData) || response.statusText}`);
            }

            const newReminder = await response.json();
            console.log('New Reminder Created:', newReminder);
            alert('Reminder created successfully!');
            // --- CORRECTED REDIRECT PATH ---
            // From public/html/reminders/ to public/html/
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Error creating reminder:', error);
            alert('Failed to create reminder: ' + error.message);
        }
    });
});
