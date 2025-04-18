// Set the table name so the menu parsing works
tableName = "_user";

/**
 * Executes a function when the document is ready.
 * @param {Function} f - The function to execute.
 */
let whenDocumentReady = (f) => {
  /in/.test(document.readyState)
    ? setTimeout("whenDocumentReady(" + f + ")", 9)
    : f();
};

// Add event listener for password update
document
  .getElementById("btn-update-password")
  .addEventListener("click", function () {
    // Retrieve password values
    const oldPassword = document
      .getElementById("inp-old-password")
      .value.trim();
    const newPassword = document
      .getElementById("inp-new-password")
      .value.trim();
    const confirmPassword = document
      .getElementById("inp-confirm-password")
      .value.trim();

    // Clear previous error messages
    document.getElementById("error-old-password").textContent = "";
    document.getElementById("error-new-password").textContent = "";
    document.getElementById("error-confirm-password").textContent = "";

    let hasError = false;

    // Validate passwords
    if (!oldPassword) {
      document.getElementById("error-old-password").textContent =
        "Old password is required.";
      hasError = true;
    }

    if (!newPassword) {
      document.getElementById("error-new-password").textContent =
        "New password is required.";
      hasError = true;
    }

    if (!confirmPassword) {
      document.getElementById("error-confirm-password").textContent =
        "Confirm password is required.";
      hasError = true;
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      document.getElementById("error-confirm-password").textContent =
        "Passwords do not match.";
      hasError = true;
    }

    if (hasError) return;

    // Prepare payload for password update
    const user = JSON.parse(localStorage.getItem("user"));
    const payload = {
      id: user.id,
      changePassword: 1,
      oldPassword,
      newPassword,
    };

    const theUrl = `${apiUrl}account-settings/`;
    const requestBody = JSON.stringify(payload);

    // Define callback for password update response
    let getPasswordUpdateDone = (response) => {
      let res = JSON.parse(response);
      if (res.status == "ok") {
        showAlert("Password Updated", 1);
      } else {
        showAlert("Error updating password please try again", 2);
      }
    };

    // Make API call to update password
    xhrcall(4, theUrl, requestBody, "json", "", getPasswordUpdateDone);
  });

// Add event listener for general settings update
document.getElementById("btn-update").addEventListener("click", () => {
  const email = document.getElementById("inp-email").value;
  let isValid = true;

  // Email validation
  if (validateEmail(email) == false) {
    isValid = false;
    showFieldError("email", "Please enter a valid email address.");
  } else hideFieldError("email");

  // Retrieve other input values
  const name = document.getElementById("inp-name").value;
  const phone = document.getElementById("inp-phone").value;
  const username = document.getElementById("inp-username").value;

  // Validate other fields
  if (name == "") {
    isValid = false;
    showFieldError("name", "Please enter a valid name.");
  } else hideFieldError("name");

  if (phone == "") {
    isValid = false;
    showFieldError("phone", "Please enter a valid phone number.");
  } else hideFieldError("phone");

  if (username == "") {
    isValid = false;
    showFieldError("username", "Please enter a valid username.");
  } else hideFieldError("username");

  if (isValid == true) {
    // Prepare payload for settings update
    const payload = {
      id: user.id, // Include id for backend update
      name: name,
      email: email,
      phone: phone,
      username: username,
    };
    const theUrl = `${apiUrl}account-settings/`;
    const requestBody = JSON.stringify(payload);

    // Define callback for settings update response
    let getUpdateDone = (response) => {
      let res = JSON.parse(response);
      if (res.status == "ok") {
        showAlert("Settings Updated", 1);
      } else {
        showAlert("Error updating settings please try again", 2);
      }
    };

    // Make API call to update settings
    xhrcall(4, theUrl, requestBody, "json", "", getUpdateDone);
  } else {
    showAlert("Error updating settings please try again", 2);
  }
});

// Execute when the document is ready
whenDocumentReady(() => {
  // Define callback for view data retrieval
  const getViewDone = (response) => {
    try {
      response = typeof response === "string" ? JSON.parse(response) : response;

      // Use the first item if data is an array
      let data = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      if (data && typeof data === "object") {
        document.getElementById("inp-name").value = data.name || "";
        document.getElementById("inp-email").value = data.email || "";
        document.getElementById("inp-phone").value = data.phone || "";
        document.getElementById("inp-username").value = data.username || "";
      } else {
        console.warn("⚠️ No data returned from API.");
      }
      document.getElementById("showBody").classList.remove("d-none");
    } catch (e) {
      console.error("❌ Error processing response:", e);
    }
  };

  // Retrieve user from local storage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user.id) {
    console.error("❌ No user ID found in localStorage.");
    return;
  }

  // Make API call to retrieve view data
  const theUrl = `${apiUrl}account-settings/?id=${user.id}`;
  xhrcall(1, theUrl, "", "json", "", getViewDone);
});
