document.addEventListener('DOMContentLoaded', () => {
    // Elements for reminders
    const remindersContainer = document.getElementById('remindersContainer');
    const deleteModal = document.getElementById('deleteConfirmationModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const toastNotification = document.getElementById('toastNotification');

    // Elements for authentication
    const token = localStorage.getItem('token');
    const userSection = document.getElementById('user-section');

    // API endpoint
    const API_BASE_URL = 'http://localhost:3000/api/notifications';
    let notificationIdToDelete = null;

    // --- Function to display toast notifications ---
    function showToast(message, type = 'success') {
        toastNotification.textContent = message;
        toastNotification.className = `toast show ${type}`;
        setTimeout(() => {
            toastNotification.className = toastNotification.className.replace('show', '');
        }, 3000);
    }

    // --- Function to fetch and display reminders ---
    async function loadReminders() {
        try {
            const response = await fetch(API_BASE_URL); 
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Authentication error. Please log in again.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const reminders = await response.json();
            displayReminders(reminders);
        } catch (error) {
            console.error('Error loading reminders:', error);
            remindersContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
        }
    }

    // --- Function to display reminders in the container ---
    function displayReminders(reminders) {
        remindersContainer.innerHTML = ''; // Clear existing content

        if (reminders.length === 0) {
            remindersContainer.innerHTML = '<p>No reminders found. Add one to get started!</p>';
            return;
        }

        reminders.forEach(reminder => {
            const reminderEl = document.createElement('div');
            reminderEl.className = 'reminder-item';
            
            const reminderDate = new Date(reminder.reminderDate).toLocaleString('en-CA');
            
            // --- FIX: This section is updated to handle the array of times ---
            // It joins the array of times into a single string for display.
            const timesText = Array.isArray(reminder.reminderTimes) && reminder.reminderTimes.length > 0
                ? reminder.reminderTimes.join(', ')
                : 'No time set';
            
            const frequencyText = Array.isArray(reminder.frequency) ? reminder.frequency.join(', ') : 'Not set';

            reminderEl.innerHTML = `
                <div class="reminder-details">
                    <h3>${reminder.reminderTitle}</h3>
                    <p><strong>Type:</strong> ${reminder.reminderType}</p>
                    <p><strong>Description:</strong> ${reminder.description || 'N/A'}</p>
                    <p><strong>Date:</strong> ${reminderDate}</p>
                    <p><strong>Times:</strong> ${timesText}</p> 
                    <p><strong>Frequency:</strong> ${frequencyText}</p>
                </div>
                <div class="reminder-actions">
                    <button class="edit-btn" data-id="${reminder.notificationId}">Edit</button>
                    <button class="delete-btn" data-id="${reminder.notificationId}">Delete</button>
                </div>
            `;
            remindersContainer.appendChild(reminderEl);
        });
    }

    // --- Event Delegation for Edit and Delete buttons ---
    remindersContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('edit-btn')) {
            const notificationId = target.dataset.id;
            window.location.href = `reminders/edit-reminder.html?id=${notificationId}`;
        }
        if (target.classList.contains('delete-btn')) {
            notificationIdToDelete = target.dataset.id;
            deleteModal.style.display = 'block';
        }
    });

    // --- Modal Logic ---
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.style.display = 'none';
        notificationIdToDelete = null;
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        if (notificationIdToDelete) {
            try {
                const response = await fetch(`${API_BASE_URL}/${notificationIdToDelete}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Failed to delete reminder');
                showToast('Reminder deleted successfully!', 'success');
                loadReminders(); // Refresh the list
            } catch (error) {
                console.error('Error deleting reminder:', error);
                showToast('Failed to delete reminder.', 'error');
            } finally {
                deleteModal.style.display = 'none';
                notificationIdToDelete = null;
            }
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target == deleteModal) {
            deleteModal.style.display = 'none';
            notificationIdToDelete = null;
        }
    });

    // --- Initial Load based on Authentication State ---
    if (token) {
        userSection.innerHTML = `<button class="profile-button">My Profile</button>`;
        document.querySelector(".profile-button").addEventListener('click', () => {
            window.location.href = "account/profile.html"; 
        });
        loadReminders();
    } else {
        userSection.innerHTML = `<button class="login-button">Login</button>`;
        document.querySelector(".login-button").addEventListener('click', () => {
            window.location.href = 'account/login.html';
        });
        remindersContainer.innerHTML = '<p>Please log in to view and manage your reminders.</p>';
        const addNewBtn = document.querySelector('.add-new-reminder-btn');
        if (addNewBtn) {
            addNewBtn.style.display = 'none';
        }
    }
});
