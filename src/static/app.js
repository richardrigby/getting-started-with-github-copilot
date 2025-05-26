document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Unregister section elements
  const unregisterForm = document.getElementById("unregister-form");
  const unregisterEmailInput = document.getElementById("unregister-email");
  const unregisterActivitySelect = document.getElementById("unregister-activity");
  const unregisterMessageDiv = document.getElementById("unregister-message");

  // Helper to get current email from form
  function getCurrentEmail() {
    return document.getElementById("email").value;
  }

  // Function to unregister from an activity
  async function unregisterFromActivity(activityName, email) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      if (response.ok) {
        unregisterMessageDiv.textContent = result.message || "Unregistered successfully.";
        unregisterMessageDiv.className = "success";
        fetchActivities();
      } else {
        unregisterMessageDiv.textContent = result.detail || "Failed to unregister.";
        unregisterMessageDiv.className = "error";
      }
      unregisterMessageDiv.classList.remove("hidden");
      setTimeout(() => {
        unregisterMessageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      unregisterMessageDiv.textContent = "Failed to unregister. Please try again.";
      unregisterMessageDiv.className = "error";
      unregisterMessageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and dropdowns
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = "";
      unregisterActivitySelect.innerHTML = "";

      // Populate activities list and dropdowns
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsTitle = document.createElement("h5");
        participantsTitle.textContent = "Participants:";
        participantsSection.appendChild(participantsTitle);

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";

        if (details.participants && details.participants.length > 0) {
          details.participants.forEach((email) => {
            const li = document.createElement("li");
            li.textContent = email;

            // Add unregister button if this is the current user's email (sign up section)
            if (email === getCurrentEmail() && getCurrentEmail()) {
              const btn = document.createElement("button");
              btn.textContent = "Unregister";
              btn.className = "unregister-btn";
              btn.style.marginLeft = "10px";
              btn.addEventListener("click", () => {
                unregisterFromActivity(name, email);
              });
              li.appendChild(btn);
            }

            participantsList.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.textContent = "No participants yet.";
          participantsList.appendChild(li);
        }

        participantsSection.appendChild(participantsList);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdowns
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);

        const unregisterOption = option.cloneNode(true);
        unregisterActivitySelect.appendChild(unregisterOption);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission (sign up)
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
        fetchActivities();
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

  // Handle form submission (unregister)
  unregisterForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = unregisterEmailInput.value;
    const activity = unregisterActivitySelect.value;

    if (!email || !activity) {
      unregisterMessageDiv.textContent = "Please enter your email and select an activity.";
      unregisterMessageDiv.className = "error";
      unregisterMessageDiv.classList.remove("hidden");
      return;
    }

    unregisterFromActivity(activity, email);
    unregisterForm.reset();
  });

  // Refresh activities when email input changes (sign up section)
  document.getElementById("email").addEventListener("input", fetchActivities);

  // Initialize app
  fetchActivities();
});
