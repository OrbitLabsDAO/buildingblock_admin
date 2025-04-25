const url = new URL(window.location.href);
let parts = url.pathname.split("/").filter(Boolean);
let tableName = parts.length > 1 ? parts[parts.length - 2] : null;
let id = url.searchParams.get("id");

document
  .getElementById("btn-update")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form submission

    const formData = new FormData(document.querySelector("form"));

    // Create a plain object from FormData and remove the 'inp-' prefix
    const formDataObject = {};
    let submitIt = true;

    formData.forEach((value, key) => {
      // Remove 'inp-' from the field name
      const cleanedKey = key.replace(/^inp-/, "");
      if (cleanedKey != "image") formDataObject[cleanedKey] = value.trim();

      // Get the field element
      const field = document.getElementById("inp-" + cleanedKey);

      // ✅ If there's a Quill editor for this field, override the value with Quill's HTML

      let isValid = checkField(field, cleanedKey, value);
      if (isValid == false) submitIt = false;
    });

    // ✅ Dynamically include Quill field values
    Object.entries(quillEditors).forEach(([key, quillInstance]) => {
      const cleanedKey = key.replace(/^inp-/, "");
      const value = quillInstance.root.innerHTML;
      formDataObject[cleanedKey] = value; // 👈 cleanedKey instead of fieldName
      //check the field
      let isValid = checkQuill(value, key, quillInstance);
      if (isValid === false) submitIt = false;
    });

    //over ride the upload as its an image
    if (cfImageDetails) {
      formDataObject.image = cfImageDetails.filename;
      formDataObject.cfid = cfImageDetails.id;
      formDataObject.cfImageUrl = cfImageDetails.variants[0];
      formDataObject.isCfImageDraft = 0;
    }

    // Proceed if all validations pass
    if (submitIt == true) {
      /**
       * @callback getEditDone
       * @param {object} response Server response
       * @description Callback function after the update request is done
       * @returns {void}
       */
      let getEditDone = (response) => {
        response = JSON.parse(response); // Parse the response
        console.log(response); // Log the response

        if (response.status == "ok") {
          showAlert("Record Updated", 1); // Show success alert
        } else {
          showAlert("Error updating record, please try again", 2); // Show error alert
        }
      };

      // Add the ID for the update request
      formDataObject.id = id;

      // Convert the object to JSON
      const requestBody = JSON.stringify(formDataObject);

      // Call the table endpoint
      let theUrl = apiUrl + `tables/${tableName}`;
      xhrcall(4, theUrl, requestBody, "json", "", getEditDone);
    }
  });

/**
 * Initializes the form by retrieving the necessary data and populating the form fields.
 * This function is called once the document is ready and relies on the following functions:
 * - getOneTimeUrl(): Retrieves a one-time URL token if the "imageTrue" element is present and its value is "true".
 * - getData(): Retrieves the data for the specified table and ID.
 * - checkForeign(): Fetches and populates foreign data into select elements.
 * - applyFormValues(): Populates the form fields with the retrieved data.
 *
 * @returns {Promise<void>} A Promise that resolves when the form is initialized.
 */
const initForm = async () => {
  // Wait for the document to be ready
  await whenDocumentReady();

  // Retrieve the one-time URL token for image uploads, oneTimeUrl in in main.js as it is global
  oneTimeUrl = await getOneTimeUrl();

  // Retrieve the data for the specified table and ID
  theData = await getData();

  // Fetch and populate foreign data into select elements
  foreignData = await checkForeign();

  // Populate the form fields with the retrieved data
  applyFormValues();

  // Show the form
  document.getElementById("showBody").classList.remove("d-none");
};

/**
 * Waits for the document to be ready and then resolves the Promise.
 * @returns {Promise<void>} A Promise that resolves when the document is ready.
 */
function whenDocumentReady() {
  return new Promise((resolve) => {
    if (document.readyState === "loading") {
      // If the document is still loading, wait for the DOMContentLoaded event
      document.addEventListener("DOMContentLoaded", resolve);
    } else {
      // If the document is already ready, resolve immediately
      resolve();
    }
  });
}

// Make sure the page is ready before starting the data retrieval and form population
whenDocumentReady().then(() => {
  initForm();
});
