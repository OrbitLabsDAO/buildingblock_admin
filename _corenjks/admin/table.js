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
    let tableName = new URL(window.location.href).pathname;
    tableName = tableName.split("/").filter(Boolean).pop();
    console.log(tableName);
    //call the create account endpoint
    url = apiUrl + `tables/${tableName}`;
    //build the json
    let bodyobj = { id: 1 };
    //string it
    var bodyobjectjson = JSON.stringify(bodyobj);
    xhrcall(1, url, bodyobjectjson, "json", "", getTableDone);
  })
);
