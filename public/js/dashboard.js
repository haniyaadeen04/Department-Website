document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    
    if (!user || !user.email) {
        window.location.href = "login.html";
        return;
    }

    try {
        // ✅ Fetch student data by email first
        const res = await fetch(`http://localhost:3001/students/email/${user.email}`);
        
        if (!res.ok) {
            console.error("Failed to fetch student data.");
            window.location.href = "login.html";
            return;
        }

        const data = await res.json();

        // ✅ Display the student details on the dashboard
        document.getElementById("details").innerHTML = `
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Course:</strong> ${data.course}</p>
            <p><strong>Year:</strong> ${data.year}</p>
            <p><strong>Contact:</strong> ${data.contact}</p>
        `;

    } catch (error) {
        console.error("Error fetching student data:", error);
        alert("Failed to fetch student details. Please try again.");
    }
});

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}
