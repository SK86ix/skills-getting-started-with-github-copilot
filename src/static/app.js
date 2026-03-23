document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    window.clearTimeout(showMessage.hideTimeout);
    showMessage.hideTimeout = window.setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  function createDetailRow(label, value) {
    const row = document.createElement("p");
    const strong = document.createElement("strong");

    strong.textContent = `${label}:`;
    row.append(strong, ` ${value}`);

    return row;
  }

  function createRemoveButton(activityName, participant) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "participant-delete-button";
    button.dataset.activity = activityName;
    button.dataset.email = participant;
    button.setAttribute("aria-label", `Unregister ${participant} from ${activityName}`);
    button.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M9 3.75h6a1.5 1.5 0 0 1 1.5 1.5V6H21v1.5h-1.125l-.82 11.48A2.25 2.25 0 0 1 16.81 21H7.19a2.25 2.25 0 0 1-2.245-2.02L4.125 7.5H3V6h4.5v-.75A1.5 1.5 0 0 1 9 3.75Zm6 .75H9V6h6V4.5Zm-5.25 5.25h-1.5v7.5h1.5v-7.5Zm6 0h-1.5v7.5h1.5v-7.5Z" />
      </svg>
    `;

    return button;
  }

  function createParticipantsSection(activityName, participants) {
    const section = document.createElement("div");
    section.className = "participants-section";

    const heading = document.createElement("p");
    heading.className = "participants-title";
    heading.textContent = "Participants";
    section.appendChild(heading);

    if (participants.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "participants-empty";
      emptyState.textContent = "No students signed up yet.";
      section.appendChild(emptyState);
      return section;
    }

    const list = document.createElement("ul");
    list.className = "participants-list";

    participants.forEach((participant) => {
      const item = document.createElement("li");
      const label = document.createElement("span");

      item.className = "participant-row";
      label.className = "participant-email";
      label.textContent = participant;
      item.append(label, createRemoveButton(activityName, participant));
      list.appendChild(item);
    });

    section.appendChild(list);
    return section;
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const title = document.createElement("h4");
        const description = document.createElement("p");
        const availability = document.createElement("span");

        title.textContent = name;
        description.className = "activity-description";
        description.textContent = details.description;
        availability.className = "availability-badge";
        availability.textContent = `${spotsLeft} spots left`;

        activityCard.append(
          title,
          description,
          createDetailRow("Schedule", details.schedule),
          createDetailRow("Availability", `${details.participants.length}/${details.max_participants} enrolled`),
          availability,
          createParticipantsSection(name, details.participants)
        );

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
        showMessage(result.message, "success");
        signupForm.reset();
        await fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  activitiesList.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest(".participant-delete-button");

    if (!deleteButton) {
      return;
    }

    const { activity, email } = deleteButton.dataset;

    deleteButton.disabled = true;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();

      if (!response.ok) {
        showMessage(result.detail || "Failed to unregister participant.", "error");
        return;
      }

      showMessage(result.message, "success");
      await fetchActivities();
    } catch (error) {
      showMessage("Failed to unregister participant. Please try again.", "error");
      console.error("Error unregistering participant:", error);
    } finally {
      deleteButton.disabled = false;
    }
  });

  // Initialize app
  fetchActivities();
});
