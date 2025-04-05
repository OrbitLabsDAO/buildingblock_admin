let whenDocumentReady = (f) => {
  /in/.test(document.readyState)
    ? setTimeout("whenDocumentReady(" + f + ")", 9)
    : f();
};

document
  .getElementById("btn-update-password")
  .addEventListener("click", function () {
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

    const user = JSON.parse(localStorage.getItem("user"));
    const payload = {
      id: user.id,
      changePassword: 1,
      oldPassword,
      newPassword,
    };

    const theUrl = `${apiUrl}account-settings/`;
    const requestBody = JSON.stringify(payload);

    let getPasswordUpdateDone = (response) => {
      let res = JSON.parse(response);
      if (res.status == "ok") {
        showAlert("Password Updated", 1);
      } else {
        showAlert("Error updating passwpord please try again", 2);
      }
    };

    xhrcall(4, theUrl, requestBody, "json", "", getPasswordUpdateDone);
  });

document.getElementById("btn-update").addEventListener("click", () => {
  const payload = {
    id: user.id, // include id so the backend knows who to update
    name: document.getElementById("inp-name").value,
    email: document.getElementById("inp-email").value,
    phone: document.getElementById("inp-phone").value,
    username: document.getElementById("inp-username").value,
  };
  const theUrl = `${apiUrl}account-settings/`;
  const requestBody = JSON.stringify(payload);

  let getUpdateDone = (response) => {
    let res = JSON.parse(response);
    if (res.status == "ok") {
      showAlert("Settings Updated", 1);
    } else {
      showAlert("Error updating settings please try again", 2);
    }
  };

  xhrcall(4, theUrl, requestBody, "json", "", getUpdateDone);
});

whenDocumentReady(() => {
  const getViewDone = (response) => {
    try {
      response = typeof response === "string" ? JSON.parse(response) : response;

      // If data is an array, use the first item
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

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user.id) {
    console.error("❌ No user ID found in localStorage.");
    return;
  }

  const theUrl = `${apiUrl}account-settings/?id=${user.id}`;
  xhrcall(1, theUrl, "", "json", "", getViewDone);
});
