// Get references to the form and message elements:
const apiBaseUrl = "http://localhost:3000";

function makeAppointment() {
    /* alert("Redirecting to appointment booking page..."); */
    window.location.href = "make-appointments.html";
}

function login() {
    window.location.href = "login-appointments.html"; 
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