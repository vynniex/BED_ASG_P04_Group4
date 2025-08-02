document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userSection = document.getElementById('user-section');

    if (token) {
      userSection.innerHTML = `<button class="profile-button">My Profile</button>`;

      document.querySelector(".profile-button").addEventListener('click', () => {
        window.location.href = "/html/account/profile.html";
      });
    } else {
      userSection.innerHTML = `<button class="login-button">Login</button>`;

      document.querySelector(".login-button").addEventListener('click', () => {
        window.location.href = '/html/account/login.html';
      });
    }
});