document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.querySelector('.btn-back');
  const addBtn = document.querySelector('.btn-add');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
        window.location.href = 'create-medicine.html';
    });
  }
});