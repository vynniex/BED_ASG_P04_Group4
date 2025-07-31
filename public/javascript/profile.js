document.addEventListener('DOMContentLoaded', () => {
    // const userData = localStorage.getItem('user');
    token = localStorage.getItem("token");

    autofillUserDetails(token);
});

async function goBack() {
    window.location.href = "index.html";
}

async function autofillUserDetails(token) {
    try {
        const response = await fetch("/api/users/profile", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

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

    const userData = await response.json();
    const [year, month, day] = userData.dob.split("T")[0].split("-");

    // Set values in HTML
    document.getElementById("profile-name").textContent = userData.full_name || '-';
    document.getElementById("profile-email").textContent = userData.email || '-';
    document.getElementById("profile-contact").textContent = "+65 " + userData.contact_num || '-';
    document.getElementById("profile-dob").textContent = `${day}/${month}/${year}` || '-';
    }catch (error) {
        console.error('Failed to parse user data:', error);
        alert('Corrupted user session. Please log in again.');
    }
} 
    

// delete user
async function handleDeleteClick(event) {
  const userId = event.target.getAttribute("data-id");
  console.log("Attempting to delete user with ID:", userId);

  // Show confirmation dialog
  const confirmed = window.confirm("Are you sure you want to delete your account?");
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
          console.log("Reloading page because no user remain");
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
        `Failed to delete user. Status: ${response.status}, Message: ${errorBody.message}`
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
    localStorage.removeItem("user");


    // Redirect to login
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout failed:", error);
    alert("Something went wrong while logging out.");
  }
}