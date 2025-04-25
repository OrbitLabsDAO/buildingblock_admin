const url = new URL(window.location.href);
let parts = url.pathname.split("/").filter(Boolean);
let tableName = parts.length > 1 ? parts[parts.length - 2] : null;
let id = url.searchParams.get("id");

/**
 * Initializes the form by retrieving the necessary data and populating the form fields.
 * This function is called once the document is ready and relies on the following functions:
 * - getData(): Retrieves the data for the specified table and ID.
 * - checkForeign(): Fetches and populates foreign data into select elements.
 * - applyFormValues(): Populates the form fields with the retrieved data.
 *
 * @returns {Promise<void>} A Promise that resolves when the form is initialized.
 */
const initForm = async () => {
  // Wait for the document to be ready
  await whenDocumentReady();

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
