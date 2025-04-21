const url = new URL(window.location.href);
let parts = url.pathname.split("/").filter(Boolean);
let tableName = parts.length > 1 ? parts[parts.length - 2] : null;
let id = url.searchParams.get("id");
let editData = "";
let foreignData = "";

/**
 * Retrieves a one-time URL token if the "imageTrue" element is present and its value is "true".
 * Makes an API call to obtain the token and removes the "imageTrue" element upon success.
 *
 * @param {Function} callback - A callback function to handle the returned URL.
 * @returns {Promise<string>} The one-time URL token if available, otherwise an empty string.
 */

/**
 * Retrieves a one-time URL token if the "imageTrue" element is present and its value is "true".
 * Makes an API call to obtain the token and removes the "imageTrue" element upon success.
 *
 * @returns {Promise<string>} The one-time URL token if available, otherwise an empty string.
 */
async function getOneTimeUrl(callback) {
  // Get the element with ID "imageTrue" from the DOM
  const imageTrueEl = document.getElementById("imageTrue");

  // Check if the element exists and its value is "true"
  if (imageTrueEl && imageTrueEl.value === "true") {
    // Construct the URL for the API call
    const theUrl = apiUrl + `getonetimetoken`;

    // Make an asynchronous GET request to obtain the token
    const res = await xhrcall2(1, theUrl, "", "json", "", "");

    // If a URL is returned in the response
    if (res.url != "") {
      // Remove the "imageTrue" element from the DOM
      imageTrueEl.remove();

      // Return the obtained URL
      return res.url;
    } else {
      // Return an empty string if no URL is received
      return "";
    }
  }

  // Return an empty string if "imageTrue" element is absent or value is not "true"
  return "";
}

/**
 * Retrieves the data for the specified table and ID.
 * Makes an API call to obtain the data and returns it in JSON format.
 *
 * @param {Function} [callback] - A callback function to handle the returned data.
 * @returns {Promise<Object>} The retrieved data in JSON format, or an empty object if no data is found.
 */
async function getData(callback) {
  // Construct the URL for the API call
  let theUrl = apiUrl + `tables/${tableName}`;

  // Add the ID to the URL if it is available
  if (id != null) theUrl += `?id=${id}`;

  // Make an asynchronous GET request to obtain the data
  const res = await xhrcall2(1, theUrl, "", "json", "", "");

  // If data is returned in the response
  if (res.data.length > 0) {
    // Return the first item in the data array
    return res.data[0];
  } else {
    // Return an empty object if no data is found
    return {};
  }
}

/**
 * Fetches and populates foreign data into select elements.
 *
 * This function queries DOM elements with specific data attributes
 * to construct lookup data for an API call. The returned foreign
 * data is then used to populate corresponding select elements with options.
 *
 * @returns {Promise<Object>} An object containing the foreign data, or an empty object if an error occurs.
 */
async function checkForeign() {
  // Gather elements with both data-foreigntable and data-foreignid attributes
  const lookups = Array.from(
    document.querySelectorAll("[data-foreigntable][data-foreignid]")
  )
    .map((field) => {
      // Extract attributes and field name
      const foreignTable = field.getAttribute("data-foreigntable");
      const foreignId = field.getAttribute("data-foreignid");
      const fieldName = field.name;
      return { foreignTable, foreignId, fieldName };
    })
    .filter(
      // Ensure all necessary attributes are present
      ({ foreignTable, foreignId, fieldName }) =>
        foreignTable && foreignId && fieldName
    );

  // Return an empty object if no valid lookups are found
  if (lookups.length === 0) return {};

  try {
    // Make API call to fetch foreign data
    const res = await xhrcall2(
      0,
      "lookups",
      JSON.stringify(lookups),
      "json",
      "",
      ""
    );

    const foreignData = res.data;

    // Populate select elements with the retrieved foreign data
    Object.entries(foreignData).forEach(([fieldName, items]) => {
      const selectEl = document.getElementById(fieldName);
      if (!selectEl) return;

      // Clear existing options and add a default option
      selectEl.innerHTML = "";
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Please Select";
      selectEl.appendChild(defaultOption);

      // Add new options based on the foreign data
      items.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        selectEl.appendChild(option);
      });
    });

    return foreignData;
  } catch (error) {
    // Log error and return an empty object in case of failure
    console.error("Error loading foreign data:", error);
    return {};
  }
}
/**
 * Applies values from the `editData` object to the form fields.
 * Supports fields of types:
 *  - input[type="number"]
 *  - input[data-type="varchar"]
 *  - input.datepicker
 *  - select
 *  - textarea
 *  - Quill editor (if present)
 *
 * If a field has a Quill editor, its HTML is used to populate the field.
 * The `foreignData` object is used to populate select dropdowns.
 */
function applyFormValues() {
  if (!editData || !foreignData) return;

  document
    .querySelectorAll(
      'input[type="number"], input[data-type="varchar"], input.datepicker, select, textarea'
    )
    .forEach((field) => {
      const rawName = field.name; // e.g. inp-userId
      const baseName = rawName.replace(/^inp-/, ""); // e.g. "userId"
      const relatedKey = baseName.endsWith("Id")
        ? baseName.slice(0, -2)
        : baseName;

      // Apply the value from the editData object if it exists
      if (editData.hasOwnProperty(baseName)) {
        const value = editData[baseName];

        // Handle datepicker separately
        if (field.classList.contains("datepicker")) {
          const parsedDate = new Date(value);
          if (!isNaN(parsedDate)) {
            // Format for the datepicker plugin: mm/dd/yyyy
            const formattedDate = `${String(parsedDate.getMonth() + 1).padStart(
              2,
              "0"
            )}/${String(parsedDate.getDate()).padStart(
              2,
              "0"
            )}/${parsedDate.getFullYear()}`;
            field.value = formattedDate;
            $(field).datepicker("update", formattedDate); // for Bootstrap-datepicker or similar
          }
        } else if (baseName === "cfImageUrl") {
          document.getElementById("image-uploading-text").innerText =
            "Image preview";
          document.getElementById("image-preview").src = value;
        } else {
          field.value = value;
        }
      }

      // Handle select dropdowns
      if (field.tagName === "SELECT") {
        const targetValue = editData[relatedKey];
        const optionsList = foreignData[rawName];

        if (Array.isArray(optionsList)) {
          const matchedOptionIndex = Array.from(field.options).findIndex(
            (option) =>
              optionsList.find((item) => item.name == targetValue)?.id ==
              option.value
          );
          if (matchedOptionIndex !== -1) {
            field.selectedIndex = matchedOptionIndex;
          }
        }
      }
    });

  // Populate any Quill editors
  Object.entries(quillEditors).forEach(([fieldName, quillInstance]) => {
    if (editData.hasOwnProperty(fieldName)) {
      quillInstance.root.innerHTML = editData[fieldName];
    }
  });

  $(".selectpicker").selectpicker("refresh");
}

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
    //TODO THIS IS REPEAT CODE IN THE ADD AND EDIT SO WE CAN MOVE IT TO MAIN
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
  editData = await getData();

  // Fetch and populate foreign data into select elements
  foreignData = await checkForeign();

  // Populate the form fields with the retrieved data
  applyFormValues();

  // Show the form
  document.getElementById("showBody").classList.remove("d-none");
};

// Make sure the page is ready before starting the data retrieval and form population
whenDocumentReady().then(() => {
  initForm();
});
