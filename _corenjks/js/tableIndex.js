// Get table name and ID from URL
const url = new URL(window.location.href);
let tableName = url.pathname.split("/").filter(Boolean).pop();
let id = url.searchParams.get("id");
let whenDocumentReady = (f) => {
  /in/.test(document.readyState)
    ? setTimeout("whenDocumentReady(" + f + ")", 9)
    : f();
};

let showElements = () => {
  const user = JSON.parse(window.localStorage.user);
  if (user.isAdmin == 1)
    document.getElementById("btn-create-cy").classList.remove("d-none");
  // Show the table
  document.getElementById("showBody").classList.remove("d-none");
};

let deleteItemDone = (response) => {
  response = JSON.parse(response);
  console.log(response.id);
  if (response.id > 0) {
    const itemId = response.status; // or get it from the event if needed
    // Initialize DataTable
    const table = $("#dataTable").DataTable();
    //delete the row
    const row = table
      .rows()
      .eq(0)
      .filter(function (rowIdx) {
        return table.cell(rowIdx, 0).data() == response.id; // Adjust column index as needed
      });

    // Remove the row from the DataTable
    table.row(row).remove().draw();
  }
};

let deleteItem = (id) => {
  if (confirm("Are you sure you want to delete this item?")) {
    xhrcall(
      3,
      apiUrl + `tables/${tableName}`,
      `{"id":${id}}`,
      "json",
      "",
      deleteItemDone
    );
  }
};

whenDocumentReady(
  (isReady = () => {
    //get the btn delete click event

    let getTableDone = (response) => {
      response = JSON.parse(response);
      if (response.data.length == 0) {
        showAlert("No data found", 2);
        showElements();
        return;
      }

      // Declare headers outside the if statement
      let headers = [];

      // Helper function to make headers nicer
      const formatHeader = (header) => {
        header = header.replace(/_/g, " "); // Replace underscores
        header = header.replace(/([a-z])([A-Z])/g, "$1 $2"); // CamelCase to Title Case
        return header
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      };

      // Helper function to truncate long text
      const truncateText = (text, maxLength = 200) => {
        if (typeof text !== "string") return text; // Ignore non-strings
        return text.length > maxLength
          ? text.slice(0, maxLength) + "..."
          : text;
      };

      // Helper function to create clickable hyperlinks
      const formatValue = (value) => {
        if (typeof value !== "string") return value;
        const urlPattern = /^(https?:\/\/[^\s]+)/g; // Match http/https URLs
        return urlPattern.test(value)
          ? `<a href="${value}" target="_blank" >View</a>`
          : truncateText(value);
      };

      // Generate table headers
      if (response.data.length > 0) {
        headers = Object.keys(response.data[0]);

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
      response.data.forEach((item) => {
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
    };
    //show admin stuff
    showElements();
    // Call the table endpoint

    let theUrl = apiUrl + `tables/${tableName}`;
    //if (tableName == "user") theUrl = apiUrl + `admin/${tableName}`;
    if (id != null) theUrl += `?id=${id}`;
    xhrcall(1, theUrl, "", "json", "", getTableDone);
  })
);
