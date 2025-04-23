// Get table name and ID from URL
const url = new URL(window.location.href);
let tableName = url.pathname.split("/").filter(Boolean).pop();
let id = url.searchParams.get("id");

/**
 * Callback function for the delete request.
 * @param {string} response - The response from the server.
 */
let deleteItemDone = (response) => {
  response = JSON.parse(response);
  // We have to remove the excluded fields
  if (response.id > 0) {
    // Get the ID of the item to delete
    const itemId = response.status; // or get it from the event if needed
    // Initialize DataTable
    const table = $("#dataTable").DataTable();
    // Find the row to delete
    const row = table
      .rows()
      .eq(0)
      .filter(function (rowIdx) {
        // Get the first column cell value of the current row
        // Adjust column index as needed
        return table.cell(rowIdx, 0).data() == response.id;
      });

    // Remove the row from the DataTable
    table.row(row).remove().draw();
  }
};
/**
 * Deletes an item with the specified ID after user confirmation.
 * Utilizes the new await method for asynchronous operation.
 * @param {number} id - The ID of the item to delete.
 */
const deleteItem = async (id) => {
  // Confirm with the user before proceeding with deletion
  if (confirm("Are you sure you want to delete this item?")) {
    try {
      // Make an asynchronous DELETE request
      const response = await xhrcall2(
        3,
        apiUrl + `tables/${tableName}`,
        `{"id":${id}}`,
        "json"
      );
      deleteItemDone(response);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }
};

/**
 * Renders the table with the data from the `theData` array.
 * Also generates the table headers based on the first object in the array.
 * @param {Array} theData - The data to render in the table.
 */
function renderTable() {
  // Declare headers outside the if statement
  let headers = [];

  // Helper function to make headers nicer
  /**
   * Replaces underscores with spaces and camelCase to Title Case.
   * @param {string} header - The header text to format.
   * @returns {string} - The formatted header text.
   */
  const formatHeader = (header) => {
    if (header == "cfImageUrl") {
      header = "Image Url";
    } else {
      header = header.replace(/_/g, " "); // Replace underscores
      header = header.replace(/([a-z])([A-Z])/g, "$1 $2"); // CamelCase to Title Case
    }
    return header
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper function to truncate long text
  /**
   * Truncates long text to the specified length and appends an ellipsis.
   * @param {string} text - The text to truncate.
   * @param {number} maxLength - The maximum length of the text.
   * @returns {string} - The truncated text.
   */
  const truncateText = (text, maxLength = 200) => {
    if (typeof text !== "string") return text; // Ignore non-strings
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  // Helper function to create clickable hyperlinks
  /**
   * Checks if the value is a URL and formats it as a clickable hyperlink.
   * @param {string} value - The value to check.
   * @returns {string} - The formatted value.
   */
  const formatValue = (value) => {
    if (typeof value !== "string") return value;
    const urlPattern = /^(https?:\/\/[^\s]+)/g; // Match http/https URLs
    return urlPattern.test(value)
      ? `<a href="${value}" target="_blank" >View</a>`
      : truncateText(value);
  };

  // Generate table headers
  if (theData.length > 0) {
    headers = Object.keys(theData[0]);

    let theadHtml = "<tr>";
    headers.forEach((header) => {
      theadHtml += `<th>${formatHeader(header)}</th>`;
    });

    // Add the action column
    theadHtml += "<th>Action</th>";
    theadHtml += "</tr>";
    document.querySelector("#dataTable thead").innerHTML = theadHtml;
  }

  // Initialize DataTable
  const table = $("#dataTable").DataTable({
    destroy: true, // Destroy existing instance before re-initializing
  });

  // Loop through the response data
  theData.forEach((item) => {
    console.log(item);
    // Format values and create a row array
    let rowData = headers.map((header) => formatValue(item[header]));

    // Add the action buttons
    rowData.push(
      `<a href="view.html?id=${item.id}" class="btn btn-success">View</a>
          <a href="edit.html?id=${item.id}" class="btn btn-primary">Edit</a>
          <a href="javascript:deleteItem(${item.id});" data-id="${item.id}" class="btn btn-danger btn-delete">Delete</a>`
    );

    table.row.add(rowData).draw(false);
  });
  showElements();
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

  // Retrieve the data for the specified table and ID
  theData = await getData(false);

  // Fetch and populate foreign data into select elements
  foreignData = await checkForeign();

  // Populate the table with the retrieved data
  renderTable();

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
