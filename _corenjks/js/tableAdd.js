const url = new URL(window.location.href);
let tableName = url.pathname.split("/").filter(Boolean).pop();

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

      // Basic integer validation
      if (field && field.type === "number") {
        if (isNaN(value) || value.trim() === "") {
          isValid = false;
          showError(cleanedKey, "Please enter a valid integer.");
        } else {
          hideError(cleanedKey);
        }
      }

      // Email validation (if the field name contains "email")
      if (cleanedKey.toLowerCase().includes("email")) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
        if (!emailPattern.test(value)) {
          isValid = false;
          showError(cleanedKey, "Please enter a valid email address.");
        } else {
          hideError(cleanedKey);
        }
      }
    });

    // Proceed if all validations pass
    if (isValid) {
      // Convert the object to JSON
      const requestBody = JSON.stringify(formDataObject);
      console.log(requestBody);
    }
  });

/**
 * Show an error message for a field
 */
function showError(fieldName, message) {
  const errorElement = document.getElementById("error-" + fieldName);
  if (errorElement) {
    errorElement.classList.remove("d-none");
    errorElement.textContent = message;
  }
}

/**
 * Hide the error message for a field
 */
function hideError(fieldName) {
  const errorElement = document.getElementById("error-" + fieldName);
  if (errorElement) {
    errorElement.classList.add("d-none");
    errorElement.textContent = "";
  }
}

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
