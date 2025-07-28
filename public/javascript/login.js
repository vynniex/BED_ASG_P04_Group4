function createAccount() {
    window.location.href = "create-account.html"
}

// Get references to the HTML elements you'll interact with:
const form = document.getElementById('login-form');
const apiBaseUrl = "http://localhost:3000";

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
      alert(`Login sucessful! Welcome ${fullName}.`);

      // After login success
      localStorage.setItem('fullName', fullName);
      localStorage.setItem('token', data.token);
      window.location.href = "manage-appointments.html";


    } catch (error) {
      alert('Error connecting to server');
      console.error(error);
    }
});
