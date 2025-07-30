// Get references to the form and message elements:
const apiBaseUrl = "http://localhost:3000";
const verifyForm = document.getElementById("verify-form");

function makeAppointment() {
    /* alert("Redirecting to appointment booking page..."); */
    window.location.href = "make-appointments.html";
}

function manageAppt() {
    const token = localStorage.getItem("token");

    if (token) {
        // Token exists
        document.getElementById("verify-form").style.display = "flex";

        const modal = document.getElementById("verify-form");
        const card = document.querySelector(".form-card");

        modal.addEventListener("click", (event) => {
            // Only close if clicking *outside* the card
            if (!card.contains(event.target)) {
            modal.style.display = "none";
            }
        })
    } else {
        // No token — block and notify user
        alert("You must be logged in to access this page. Please log in first.");
    }
}

const currentPath = window.location.pathname.toLowerCase();
const navLinks = document.querySelectorAll(".navbar a");

navLinks.forEach(link => {
    const href = link.getAttribute("href").toLowerCase();

    // Only match real links (not #) and check if href is part of path
    if (href !== "#" && currentPath.includes(href.replace('./', ''))) {
      link.classList.add("active");
    }
});

verifyForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent page reload on submit

    const nric = document.getElementById('nric').value.trim();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${apiBaseUrl}/api/appointments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nric }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Login failed: ' + (errorData.message || 'Unknown error'));
        return;
      }

      const data = await response.json();
      console.log(data);
      // console.log(data.user[0].full_name);
      alert('Login successful');
      
      // After login success
      window.location.href = "manage-appointments.html";


    } catch (error) {
      alert('Error connecting to server');
      console.error(error);
    }
});
