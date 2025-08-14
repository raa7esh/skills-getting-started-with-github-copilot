document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // helper to avoid injecting raw HTML from participants/emails
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Clear select options (keep the default placeholder if present)
      activitySelect.innerHTML = "";
      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent = "-- Select an activity --";
      placeholderOption.disabled = true;
      placeholderOption.selected = true;
      activitySelect.appendChild(placeholderOption);

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants list (pretty, with a fallback)
        const participants = Array.isArray(details.participants) ? details.participants : [];
        const participantsListHTML = participants.length
          ? `<ul style="list-style: disc; padding-left:1.1rem; margin:8px 0 0 0;">${participants
              .map((p) => `<li style="margin:4px 0; font-size:0.95rem;">${escapeHTML(p)}</li>`)
              .join("")}</ul>`
          : `<p style="font-style:italic; color:#555; margin:8px 0 0 0;">No participants yet</p>`;

        activityCard.innerHTML = `
          <h4 style="margin:0 0 6px 0;">${escapeHTML(name)}</h4>
          <p style="margin:0 0 6px 0; color:#333;">${escapeHTML(details.description)}</p>
          <p style="margin:0 0 6px 0; font-size:0.95rem;"><strong>Schedule:</strong> ${escapeHTML(details.schedule)}</p>
          <p style="margin:0 0 8px 0; font-size:0.95rem;"><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants" style="background:#fafafa;border-radius:6px;padding:8px;border:1px solid #eee;">
            <h5 style="margin:0 0 6px 0;font-size:0.95rem;">Participants</h5>
            ${participantsListHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
