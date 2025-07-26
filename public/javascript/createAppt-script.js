// Get references to the form and message elements:
const appointmentForm = document.getElementById("appointment-form");
const apiBaseUrl = "http://localhost:3000";


appointmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // collect form data
    const newAppointmentData = {
        nric: document.getElementById("nric").value.trim(),
        fullName: document.getElementById("fullName").value.trim().toUpperCase(),
        email: document.getElementById("email").value.trim(),
        contact: document.getElementById("contactNum").value.trim(),
        dob: document.getElementById("dob").value,
        appointmentDate: document.getElementById("appointmentDate").value,
        appointmentTime: document.getElementById("appointmentTime").value,
        clinic: document.getElementById("clinic").value,
        reason: document.querySelector('input[name="reason"]:checked')?.value,
    }

    console.log(newAppointmentData);

    try {
        // Make a POST request to your API endpoint
        const response = await fetch(`${apiBaseUrl}/api/appointments`, {
        method: "POST", // Specify the HTTP method
        headers: {
            "Content-Type": "application/json", // Tell the API we are sending JSON
        },
        body: JSON.stringify(newAppointmentData), // Send the data as a JSON string in the request body
        });

        // Check for API response status (e.g., 201 Created, 400 Bad Request, 500 Internal Server Error)
        const responseBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };

        if (response.status === 201) {
            alert("Appointment booked successfully!");
            console.log("Created Appointment:", responseBody);

            appointmentForm.reset();
        } else if (response.status === 400) {
            console.error("Validation Error:", responseBody);
            alert(`Validation Error: ${responseBody.message}`);
        } else {
            // Handle other potential API errors (e.g., 500 from error handling middleware)
            throw new Error(
                `API error! status: ${response.status}, message: ${responseBody.message || "No message."}`
            );
        }
    }catch (error) {
        console.error("Error creating appointment:", error);
        alert(`Failed to book appointment: ${error.message}`);
    }
})

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "appointments.html";
  }
}

