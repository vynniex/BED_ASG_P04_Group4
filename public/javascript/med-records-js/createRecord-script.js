document.addEventListener("DOMContentLoaded", () => {
  const feelingButtons = document.querySelectorAll(".feeling-btn");
  const feelingInput = document.getElementById("feeling");

  // Handle feeling selection
  feelingButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Remove "selected" class from all buttons
      feelingButtons.forEach(btn => btn.classList.remove("selected"));

      // Add "selected" class to clicked button
      button.classList.add("selected");

      // Set hidden input value
      feelingInput.value = button.dataset.value;
    });
  });

  // Handle form submission
  const form = document.getElementById("record-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      date: document.getElementById("record-date").value,
      feeling: document.getElementById("feeling").value,
      systolic: parseInt(document.getElementById("systolic").value),
      diastolic: parseInt(document.getElementById("diastolic").value),
      bloodSugar: parseInt(document.getElementById("blood-sugar").value),
      weight: parseFloat(document.getElementById("weight").value)
    };

    try {
      const response = await fetch("http://localhost:3000/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (response.ok) {
        alert("Record added successfully!");
        window.location.href = "records.html";
      } else {
        alert(result.error || "Failed to add record.");
      }
    } catch (err) {
      alert("Error connecting to backend.");
      console.error(err);
    }
  });
});