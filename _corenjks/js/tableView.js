const url = new URL(window.location.href);
let parts = url.pathname.split("/").filter(Boolean);
let tableName = parts.length > 1 ? parts[parts.length - 2] : null;
let id = url.searchParams.get("id");

let whenDocumentReady = (f) => {
  /in/.test(document.readyState)
    ? setTimeout("whenDocumentReady(" + f + ")", 9)
    : f();
};

whenDocumentReady(
  (isReady = () => {
    let getViewDone = (response) => {
      response = JSON.parse(response);
      console.log(response);

      if (response.data.length > 0) {
        const data = response.data[0];
        // Loop through the returned data and populate the form fields
        Object.keys(data).forEach((key) => {
          if (key == "cfImageUrl") {
            document.getElementById("image-div").classList.add("d-none");
            document.getElementById("image-uploading-text").innerText =
              "Image preview";
            document.getElementById("image-preview").src = data[key];
          } else {
            let field = document.getElementById("inp-" + key);
            if (field) {
              if (key != "image") field.value = data[key];

              // Set the value of the field
            } else {
              //we didnt find it so lets look again with id
              let field2 = document.getElementById("inp-" + key + "Id");
              if (field2) {
                field2.type == "text";
                field2.value = data[key];
              }
            }
          }
        });
      }
      document.getElementById("showBody").classList.remove("d-none");
    };
    // Show the table
    let theUrl = apiUrl + `tables/${tableName}`;
    if (id != null) theUrl += `?id=${id}`;
    xhrcall(1, theUrl, "", "json", "", getViewDone);
  })
);
