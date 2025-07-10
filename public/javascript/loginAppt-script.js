// Get references to the HTML elements you'll interact with:
const form = document.getElementById('login-form');
const apiBaseUrl = "http://localhost:3000";

function goBack() {
  window.location.href = "appointments.html";
}

// login
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent page reload on submit

    const nric = document.getElementById('nric').value.trim();
    const fullName = document.getElementById('name').value.trim();

    try {
      const response = await fetch(`${apiBaseUrl}/api/appointments/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nric, fullName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Login failed: ' + (errorData.message || 'Unknown error'));
        return;
      }

      const data = await response.json();
      console.log(data);
      console.log(data.user[0].full_name);
      alert('Login successful! Welcome, ' + data.user[0].full_name || 'User');
      
      // After login success
      localStorage.setItem('nric', nric);
      localStorage.setItem('fullName', fullName);
      window.location.href = "manage-appointments.html";


    } catch (error) {
      alert('Error connecting to server');
      console.error(error);
    }
});