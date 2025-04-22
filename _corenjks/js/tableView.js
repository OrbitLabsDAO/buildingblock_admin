const url = new URL(window.location.href);
let parts = url.pathname.split("/").filter(Boolean);
let tableName = parts.length > 1 ? parts[parts.length - 2] : null;
let id = url.searchParams.get("id");
let editData = "";
let foreignData = "";
/*
  TODO add the applyfromvaluem get data and getforienddata function from edit and view and move to main
  
*/

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

function applyFormValues() {
  if (!editData || !foreignData) return;

  document
    .querySelectorAll(
      'input[type="tel"],input[type="real"],input[type="email"],input[type="map"], input[type="number"], input[data-type="varchar"], input.datepicker, select, textarea'
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

      if (baseName == "map") {
        document.getElementById("inp-map-view").src = editData[baseName];
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

const initForm = async () => {
  // Wait for the document to be ready
  await whenDocumentReady();

  // Retrieve the data for the specified table and ID
  editData = await getData();

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
