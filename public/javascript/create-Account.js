const signUpForm = document.getElementById("signUp-form");

function goBack() {
    window.location.href = "login.html";
}


signUpForm.addEventListener("submit", async (event) => {
    event.preventDefault();
});