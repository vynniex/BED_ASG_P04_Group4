// Get references to the HTML elements you'll interact with:
const dashboard = document.getElementById("dashboard");
const apiBaseUrl = "http://localhost:3000";

async function goBack() {
  window.location.href = "appointments.html";
}

// Function to fetch appointments from the API and display them
async function fetchAppointments() {
  try {
    const nric = localStorage.getItem('nric');
    const fullName = localStorage.getItem('fullName');
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("User not logged in. Please log in again.");
      window.location.href = "login-appointments.html";
      return;
    }

    // Make a GET request to your API endpoint
    const response = await fetch(`${apiBaseUrl}/api/appointments/login/users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

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

    // Show message if there are no appointments
    if (appointments.length === 0) {
      const noApptElement = document.querySelector(".noApptMsg");
      if (noApptElement) {
        noApptElement.style.display = "block";
      }
    }

    // let userInfo = {} // Use {} instead of null to store user data for autofill; avoids null checks later.
    let updatedFields = {};

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



      // Selected Fields that can be updated
      updatedFields[appt.appointment_id] = {
        contactNum: appt.contact_num,
        appointmentDate: appt.appointment_date,
        appointmentTime: appt.appointment_time,
        clinic: appt.clinic
      }
    });
    // localStorage.setItem("userInfo", JSON.stringify(userInfo));
    // console.log(userInfo);
    sessionStorage.setItem("updatedFields", JSON.stringify(updatedFields));
    console.log(updatedFields);
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", handleDeleteClick);
    });

  } catch (error) {
    console.error("Failed to fetch appointments:", error.message);
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
        
        const remainingAppt = document.querySelectorAll(".appointment-card");
        if (remainingAppt.length === 0) {
          console.log("Reloading page because no appointments remain");
          location.reload();
        }
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
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("appointmentId");

    // Redirect to login
    window.location.href = "login-appointments.html";
  } catch (error) {
    console.error("Logout failed:", error);
    alert("Something went wrong while logging out.");
  }
}
