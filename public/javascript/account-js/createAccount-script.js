const signUpForm = document.getElementById("signUp-form");
const apiBaseUrl = "http://localhost:3000";

function goBack() {
    window.location.href = "login.html";
}


signUpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // collect form data
    const newUserData = {
        nric: document.getElementById("nric").value.trim(),
        fullName: document.getElementById("fullName").value.trim().toUpperCase(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value.trim(),
        contact: document.getElementById("contactNum").value.trim(),
        dob: document.getElementById("dob").value,
    }

    try {
        // Make a POST request to your API endpoint
        const response = await fetch(`${apiBaseUrl}/api/users/signup`, {
        method: "POST", // Specify the HTTP method
        headers: {
            "Content-Type": "application/json", // Tell the API we are sending JSON
        },
        body: JSON.stringify(newUserData), // Send the data as a JSON string in the request body
        });

        // Check for API response status (e.g., 201 Created, 400 Bad Request, 500 Internal Server Error)
        const responseBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };

        if (response.status === 201) {
            alert("User created successfully!");
            console.log("Created User:", responseBody);
            window.location.href = "../../html/account/login.html";

            signUpForm.reset();
        } else if (response.status === 400) {
            console.error("Validation Error:", responseBody);
            alert(`Validation Error: ${responseBody.message}`);
        } else {
            // Handle other potential API errors (e.g., 500 from error handling middleware)
            throw new Error(responseBody.message || "Unkown error");
        }
    }catch (error) {
        console.error("Error creating user:", error);
        alert(`Failed to created user: ${error.message}. Please try again`);
    }
});