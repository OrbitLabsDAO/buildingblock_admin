const url = new URL(window.location.href);
let parts = url.pathname.split("/").filter(Boolean);
let tableName = parts.length > 1 ? parts[parts.length - 2] : null;
let id = url.searchParams.get("id");

let whenDocumentReady = (f) => {
  /in/.test(document.readyState)
    ? setTimeout("whenDocumentReady(" + f + ")", 9)
    : f();
};

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

document
  .getElementById("btn-update")
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
      let getEditDone = (response) => {
        response = JSON.parse(response);
        if (response.status == "ok") {
          showAlert("Record Updated", 1);
        } else {
          showAlert("Error updating record please try again", 2);
        }
      };
      // Convert the object to JSON
      const requestBody = JSON.stringify(formDataObject);
      console.log(requestBody);
      // Call the table endpoint
      let theUrl = apiUrl + `tables/${tableName}`;
      xhrcall(4, theUrl, requestBody, "json", "", getEditDone);
    }
  });

whenDocumentReady(
  (isReady = () => {
    let getTableDone = (response) => {
      response = JSON.parse(response);
      if (response.data.length > 0) {
        const data = response.data[0];
        // Loop through the returned data and populate the form fields
        Object.keys(data).forEach((key) => {
          let field = document.getElementById("inp-" + key);
          if (field) {
            field.value = data[key]; // Set the value of the field
          }
        });
      }

      document.getElementById("showBody").classList.remove("d-none");
    };
    // Show the table
    let theUrl = apiUrl + `tables/${tableName}`;
    if (id != null) theUrl += `?id=${id}`;
    xhrcall(1, theUrl, "", "json", "", getTableDone);
  })
);
