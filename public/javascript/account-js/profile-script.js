const apiBaseUrl = "http://localhost:3000";

document.addEventListener('DOMContentLoaded', () => {
  // const userData = localStorage.getItem('user');
  token = localStorage.getItem("token");

  // Check if token exists 
  if (!token) {
    alert("You are not logged in. Please log in to view your profile.");
    window.location.href = "../account/login.html"; // or wherever your login page is
    return;
  }

  // Token exists (User is logged in)
  autofillUserDetails(token);
  getUserId(token);
  
  document.querySelector(".edit-btn").addEventListener("click", () => {
    window.location.href = "../account/edit-profile.html";
  });
  
  document.querySelector(".delete-btn").addEventListener("click", handleDeleteClick);
});

async function goBack() {
    window.location.href = "../index.html";
}

async function autofillUserDetails(token) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/users/profile`, {
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

// get userId
async function getUserId(token) {
  try {
      const response = await fetch(`${apiBaseUrl}/api/users/profile`, {
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
    localStorage.setItem("userId", JSON.stringify(userData.userId));
  } catch(error) {
    console.error("Failed to get userId: ", error.message);
  }
};
    

// delete user
async function handleDeleteClick(event) {
  const userId = localStorage.getItem("userId")
  console.log("Attempting to delete user with ID:", userId);

    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to delete your account?");
    if (!confirmed) {
      return; // User canceled the deletion
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.status === 204) {
        alert("Account deleted successfully.");
        localStorage.clear();
        window.location.href = "index.html";
      }
      else if (response.status === 400) {
        alert("User still has exisitng appointments and cannot be deleted.");
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
    localStorage.clear();

    // Redirect to login
    window.location.href = "../index.html";
  } catch (error) {
    console.error("Logout failed:", error);
    alert("Something went wrong while logging out.");
  }
}