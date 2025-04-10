const url = new URL(window.location.href);
let parts = url.pathname.split("/").filter(Boolean);
let tableName = parts.length > 1 ? parts[parts.length - 2] : null;

document
  .getElementById("btn-create")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form submission

    const formData = new FormData(document.querySelector("form"));

    // Create a plain object from FormData and remove the 'inp-' prefix
    const formDataObject = {};
    let isValid = true;

    formData.forEach((value, key) => {
      // Remove 'inp-' from the field name
      const cleanedKey = key.replace(/^inp-/, "");
      formDataObject[cleanedKey] = value.trim();

      // Get the field element
      const field = document.getElementById("inp-" + cleanedKey);

      // Basic validation for non-empty fields
      if (value.trim() === "") {
        isValid = false;
        showFieldError(cleanedKey, "This field cannot be blank.");
      } else {
        hideFieldError(cleanedKey);
      }

      // Email validation (if the field name contains "email")
      //console.log
      if (cleanedKey.toLowerCase().includes("email")) {
        if (validateEmail(value) == false) {
          isValid = false;
          showFieldError(cleanedKey, "Please enter a valid email address.");
        } else hideFieldError(cleanedKey);
      }

      // Basic integer validation
      if (field && field.type === "number") {
        if (isNaN(value) || value.trim() === "") {
          isValid = false;
          showFieldError(cleanedKey, "Please enter a valid integer.");
        } else {
          hideFieldError(cleanedKey);
        }
      }

      // Email validation (if the field name contains "email")
      if (cleanedKey.toLowerCase().includes("email")) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
        if (!emailPattern.test(value)) {
          isValid = false;
          showFieldError(cleanedKey, "Please enter a valid email address.");
        } else {
          hideFieldError(cleanedKey);
        }
      }
    });

    // Proceed if all validations pass
    if (isValid) {
      // Convert the object to JSON
      const requestBody = JSON.stringify(formDataObject);
      // Call the table endpoint
      let theUrl = apiUrl + `tables/${tableName}`;
      xhrcall(0, theUrl, requestBody, "json", "", getAddDone);
    }
  });

let getAddDone = (response) => {
  response = JSON.parse(response);
  if (response.status == "ok") showAlert("Record Added", 1);
  else showAlert(response.error, 2);
};

/**
 * Show an error message for a field
 */

let whenDocumentReady = (f) => {
  /in/.test(document.readyState)
    ? setTimeout("whenDocumentReady(" + f + ")", 9)
    : f();
};

whenDocumentReady(
  (isReady = () => {
    // Show the table
    document.getElementById("showBody").classList.remove("d-none");
  })
);
