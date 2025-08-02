document.addEventListener("DOMContentLoaded", () => {
  appointmentId = localStorage.getItem("appointmentId");
  console.log("Edit appointment with appointmentId:", appointmentId);

  // Call this when opening the edit form
  autofillAppointmentForm(appointmentId);
});

async function autofillAppointmentForm(appointmentId) {
  try {
    const response = await fetch(`/api/users/appointments/${appointmentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });

    if (!response) {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message}`
      );
    }

    const appt = await response.json();
    const date = appt.appointment_date.split("T")[0];

    document.getElementById("appointmentDate").value = date;
    document.getElementById("appointmentTime").value = appt.appointment_time;
    document.getElementById("clinic").value = appt.clinic;

  } catch(error) {
    console.error("Error: ", error);
  }
};

function goBack() {
    window.location.href = "manage-appointments.html";
}

async function submitForm(event) {
  event.preventDefault(); // Prevent page reload

  // Get the values from the form
  const appointmentDate = document.getElementById("appointmentDate").value;
  const appointmentTime = document.getElementById("appointmentTime").value;
  const clinic = document.getElementById("clinic").value;

  // Construct request body
  const updatedData = {
    appointment_date: appointmentDate,
    appointment_time: appointmentTime,
    clinic: clinic,
  };

  console.log("Test: ",updatedData);

  // Get appointment ID (assuming it's in the URL or localStorage)
  const appointmentId = localStorage.getItem("appointmentId"); // adjust as needed

  try {
    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      alert("Appointment updated successfully!");
      // Optional: redirect or refresh page
      window.location.href = "manage-appointments.html";
    } else {
      const err = await response.json();
      alert("Error updating appointment: " + err.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong while updating.");
  }

  return false; // Prevent default form submission
}