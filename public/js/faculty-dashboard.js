document.addEventListener("DOMContentLoaded", async () => {
  const faculty = JSON.parse(localStorage.getItem("currentFaculty"));
  
  if (!faculty || !faculty.email) {
    window.location.href = "login.html";  // Redirect if faculty is not logged in
    return;
  }

  try {
    // Fetch faculty data by email
    const res = await fetch(`http://localhost:5000/faculty/email/${faculty.email}`);
    
    if (!res.ok) {
      console.error("Failed to fetch faculty data.");
      window.location.href = "login.html";  // Redirect if there was an issue fetching data
      return;
    }

    const data = await res.json();

    // Display the faculty details on the dashboard
    document.getElementById("faculty-details").innerHTML = `
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Designation:</strong> ${data.designation}</p>
      <p><strong>Department:</strong> ${data.department}</p>
      <p><strong>Contact:</strong> ${data.contact}</p>
    `;
  } catch (error) {
    console.error("Error fetching faculty data:", error);
    alert("Failed to fetch faculty details. Please try again.");
  }
});

function logout() {
  localStorage.removeItem("currentFaculty");
  window.location.href = "login.html";  // Redirect to login page on logout
}
