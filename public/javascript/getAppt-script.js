// Get references to the HTML elements you'll interact with:
const dashboard = document.getElementById("dashboard");
const apiBaseUrl = "http://localhost:3000";

// Function to fetch appointments from the API and display them
async function fetchAppointments() {
  try {
    const nric = localStorage.getItem('nric');
    const fullName = localStorage.getItem('fullName');

    // if (!nric || !fullName) {
    //   alert("NRIC and Full Name are required.");
    //   return;
    // }

    // Make a GET request to your API endpoint
    const response = await fetch(`${apiBaseUrl}/api/appointments/users/${nric}/${fullName}`);

    if (!response.ok) {
      // Handle HTTP errors (e.g., 404, 500)
      // Attempt to read error body if available, otherwise use status text
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message}`
      );
    }

    // Parse the JSON response
    const appointments = await response.json();

    // Sort by appointment date
    appointments.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));

    // Loop through each appointment and create the HTML
    appointments.forEach(appt => {
      const card = document.createElement("div");
      const now = new Date();
      const appointmentDate = new Date(appt.appointment_date);
      console.log(appt.appointment_date);
      const status = appointmentDate >= now ? "Upcoming" : "Completed";
      card.className = "appointment-card";
      card.innerHTML = `
        <div class="appointment-details">
          <div class="detail-row">
            <div class="label merriweather-sans-regular">Date and time</div>
            <div class="value lato-regular">${appt.formatted_datetime}</div>
          </div>
          <div class="detail-row">
            <div class="label merriweather-sans-regular">Location</div>
            <div class="value lato-regular">${appt.clinic}</div>
          </div>
          <div class="detail-row">
            <div class="label merriweather-sans-regular">Service</div>
            <div class="value lato-regular">${appt.reason}</div>
          </div>
          <div class="detail-row">
            <div class="label merriweather-sans-regular">Status</div>
            <div class="value lato-regular status ${status.toLowerCase()}">${status}</div>
          </div>
        </div>
        <div class="appointment-actions merriweather-sans-regular">
          <button class="edit-btn" onclick="editAppointment('${appt.appointment_id}')">Edit</button>
          <button class="delete-btn" data-id="${appt.appointment_id}">Delete</button>
        </div>
      `;

      // Insert before the footer (optional)
      const footer = document.querySelector(".appointment-footer");
      dashboard.insertBefore(card, footer);
    });
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", handleDeleteClick);
    });

  } catch (error) {
    console.error("Failed to fetch appointments:", error.message);
    alert("Unable to load appointments. Please try again later.");
  }
}

function editAppointment(appointmentId) {
  localStorage.setItem("appointmentId", appointmentId);
  window.location.href = `edit-appointment.html`; 
}

// Run the function when the page loads
document.addEventListener("DOMContentLoaded", fetchAppointments);

// delete appointment
async function handleDeleteClick(event) {
  const appointmentId = event.target.getAttribute("data-id");
  console.log("Attempting to delete appointment with ID:", appointmentId);

  // Show confirmation dialog
  const confirmed = window.confirm("Are you sure you want to delete this appointment?");
  if (!confirmed) {
    return; // User canceled the deletion
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/appointments/${appointmentId}`, {
      method: "DELETE",
    });

     if (response.status === 204) {
      const appointmentItem = event.target.closest(".appointment-card");
      if (appointmentItem) {
        appointmentItem.remove();
      }
    }
    else {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : {message: response.statusText};

      throw new Error(
        `Failed to delete appointment. Status: ${response.status}, Message: ${errorBody.message}`
      );
    }
  } catch (error) {
    console.error("Error: ", error.message);
  }
};

// logout user
async function logoutUser() {
  const confirmLogout = confirm("Are you sure you want to log out?");
  if (!confirmLogout) return;

  try {
    localStorage.removeItem("nric");
    localStorage.removeItem("fullName");
    localStorage.removeItem("appointmentId");

    // Redirect to login
    window.location.href = "login-appointments.html";
  } catch (error) {
    console.error("Logout failed:", error);
    alert("Something went wrong while logging out.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logoutUser);
    }
});