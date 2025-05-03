async function fetchAnnouncements() {
    console.log("Fetching announcements...");
    try {
      const res = await fetch("http://localhost:5000/api/announcements");
  
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }
  
      const data = await res.json();
      console.log("Fetched data:", data); // Log the data to see what’s returned
  
      const list = document.getElementById("announcementList");
      list.innerHTML = ""; // Clear any existing content
  
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((a) => {
          list.innerHTML += `
            <div class="announcement-item">
              <h4>${a.title}</h4>
              <p>${a.description}</p>
              <p><strong>Target:</strong> ${a.target_audience}</p>
              <p><strong>Posted by:</strong> ${a.created_by || 'Unknown'} on ${new Date(a.created_at).toLocaleString()}</p>
              ${a.attachment_path ? `<a href="http://localhost:5000/${a.attachment_path}" target="_blank">Download Attachment</a>` : ""}
            </div>
          `;
        });
      } else {
        list.innerHTML = "<p>No announcements found.</p>";
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      alert("Failed to fetch announcements. Check the console for more details.");
    }
  }
  