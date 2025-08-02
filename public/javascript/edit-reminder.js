document.addEventListener('DOMContentLoaded', async () => {
    const editReminderForm = document.getElementById('editReminderForm');
    const reminderIdField = document.getElementById('reminderId');
    const reminderTypeInput = document.getElementById('editReminderType');
    const reminderTitleInput = document.getElementById('editReminderTitle');
    const reminderDescriptionTextarea = document.getElementById('editReminderDescription');
    const reminderDateInput = document.getElementById('editReminderDate');
    const timesPerDayInput = document.getElementById('timesPerDay');
    const timeInputsWrapper = document.getElementById('timeInputsWrapper');
    const frequencyCheckboxes = document.querySelectorAll('input[name="frequency"]');
    const toastNotification = document.getElementById('toastNotification');

    function showToast(message, type = 'error') {
        toastNotification.textContent = message;
        toastNotification.className = `toast show ${type}`;
        setTimeout(() => {
            toastNotification.className = toastNotification.className.replace('show', '');
        }, 3000);
    }

    function generateTimeInputs(count, times = []) {
        timeInputsWrapper.innerHTML = '';
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
                input.className = 'reminder-time-input';
                input.required = true;
                if (times[i - 1]) {
                    input.value = times[i - 1];
                }
                timeInputGroup.appendChild(label);
                timeInputGroup.appendChild(input);
                container.appendChild(timeInputGroup);
            }
            timeInputsWrapper.appendChild(container);
        }
    }

    const API_BASE_URL = 'http://localhost:3000/api/notifications';
    const urlParams = new URLSearchParams(window.location.search);
    const reminderId = urlParams.get('id');

    if (!reminderId) {
        showToast('No reminder ID found.', 'error');
        return;
    }

    async function loadReminderData(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`);
            if (!response.ok) throw new Error('Failed to load reminder data.');
            const reminder = await response.json();
            
            reminderIdField.value = reminder.notificationId;
            reminderTypeInput.value = reminder.reminderType;
            reminderTitleInput.value = reminder.reminderTitle;
            reminderDescriptionTextarea.value = reminder.description;
            // Format date correctly for input[type=date]
            reminderDateInput.value = new Date(reminder.reminderDate).toISOString().split('T')[0];
            timesPerDayInput.value = reminder.timesPerDay;

            const reminderFrequencies = reminder.frequency || [];
            frequencyCheckboxes.forEach(checkbox => {
                checkbox.checked = reminderFrequencies.includes(checkbox.value);
            });

            // Generate time inputs with existing values
            generateTimeInputs(reminder.timesPerDay, reminder.reminderTimes);

        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    timesPerDayInput.addEventListener('input', (event) => {
        const count = parseInt(event.target.value, 10) || 0;
        generateTimeInputs(count);
    });

    editReminderForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = reminderIdField.value;
        const timeInputs = document.querySelectorAll('.reminder-time-input');
        const reminderTimes = Array.from(timeInputs).map(input => input.value);
        const frequencies = Array.from(document.querySelectorAll('input[name="frequency"]:checked')).map(cb => cb.value);

        if (reminderTimes.some(time => !time)) {
            showToast('Please fill in all time fields.', 'error');
            return;
        }

        const updatedData = {
            reminderType: reminderTypeInput.value,
            reminderTitle: reminderTitleInput.value.trim(),
            description: reminderDescriptionTextarea.value.trim(),
            date: reminderDateInput.value,
            timesPerDay: parseInt(timesPerDayInput.value, 10),
            reminderTimes: reminderTimes,
            frequency: frequencies
        };

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (!response.ok) throw new Error('Failed to update reminder.');
            showToast('Reminder updated successfully!', 'success');
            window.location.href = '../../index.html';
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    loadReminderData(reminderId);
});
