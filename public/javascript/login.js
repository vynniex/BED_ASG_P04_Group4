// Get references to the HTML elements you'll interact with:
const form = document.getElementById('login-form');
const apiBaseUrl = "http://localhost:3000";

function createAccount() {
    window.location.href = "create-account.html"
}

// login
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent page reload on submit

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const response = await fetch(`${apiBaseUrl}/api/appointments/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Login failed: ' + (errorData.message || 'Unknown error'));
        return;
      }

      const data = await response.json();
      console.log(data);
      console.log(data.user);
      alert(`Login sucessful! Welcome ${data.user.fullName}.`);

      // After login success
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      window.location.href = "index.html";


    } catch (error) {
      alert('Error connecting to server');
      console.error(error);
    }
});
