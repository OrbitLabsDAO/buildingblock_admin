let whenDocumentReady = (f) => {
  /in/.test(document.readyState)
    ? setTimeout("whenDocumentReady(" + f + ")", 9)
    : f();
};
whenDocumentReady(
  (isReady = () => {
    let getTableDone = (response) => {
      response = JSON.parse(response);
      console.log(response);
    };

    //get the last / from the url
    const url = new URL(window.location.href);
    let tableName = url.pathname.split("/").filter(Boolean).pop(); // Get table name from path
    let id = url.searchParams.get("id"); // Get 'id' from query parameters

    //call the table endpoint
    let theUrl = apiUrl + `tables/${tableName}`;
    if (id != null) theUrl = apiUrl + `tables/${tableName}?id=${id}`;
    xhrcall(1, theUrl, "", "json", "", getTableDone);
  })
);
