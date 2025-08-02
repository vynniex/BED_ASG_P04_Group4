const apiBaseUrl = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in to edit your profile.");
    window.location.href = "../account/login.html";
    return;
  }

  // Load user data into form
  loadUserProfile(token);

  // Handle form submission
  document.getElementById("edit-profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await updateUserProfile(token);
  });

  // Cancel button
  document.querySelector(".cancel-btn").addEventListener("click", () => {
    window.location.href = "profile.html";
  });
});

async function loadUserProfile(token) {
  try {
    const response = await fetch(`${apiBaseUrl}/api/users/profile`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const userData = await response.json();

    document.getElementById("full-name").value = userData.full_name || "";
    document.getElementById("email").value = userData.email || "";
    document.getElementById("contact-num").value = userData.contact_num || "";
    // Convert DOB to yyyy-mm-dd for <input type="date">
    if (userData.dob) {
      document.getElementById("dob").value = userData.dob.split("T")[0];
    }
  } catch (error) {
    console.error(error);
    alert("Failed to load profile data.");
  }
}

async function updateUserProfile(token) {
  const fullName = document.getElementById("full-name").value.trim();
  const email = document.getElementById("email").value.trim();
  const contactNum = document.getElementById("contact-num").value.trim();
  const dob = document.getElementById("dob").value;

  if (!fullName || !email || !contactNum || !dob) {
    alert("Please fill in all fields.");
    return;
  }

  const payload = {
    full_name: fullName,
    email: email,
    contact_num: contactNum,
    dob: dob,
  };

  try {
    const response = await fetch(`${apiBaseUrl}/api/users/profile`, {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.message || "Update failed");
    }

    alert("Profile updated successfully!");
    window.location.href = "profile.html"; 
  } catch (error) {
    console.error(error);
    alert("Failed to update profile: " + error.message);
  }
}