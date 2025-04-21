const url = new URL(window.location.href);
let parts = url.pathname.split("/").filter(Boolean);
let tableName = parts.length > 1 ? parts[parts.length - 2] : null;
function checkForeign() {
  const looksUps = Array.from(
    document.querySelectorAll("[data-foreigntable], [data-foreignid]")
  )
    .map((field) => {
      const foreignTable = field.getAttribute("data-foreigntable") || "";
      const foreignId = field.getAttribute("data-foreignid") || "";
      const fieldName = field.name || "";
      return { foreignTable, foreignId, fieldName };
    })
    .filter(
      ({ foreignTable, foreignId, fieldName }) =>
        foreignTable && foreignId && fieldName
    ); // Only include fields with both attributes

  if (looksUps.length > 0) {
    // Convert the looksUps array to a JSON string

    //debug for testing more than one dropdown
    //looksUps.push({
    //  foreignTable: "property",
    //  foreignId: "id",
    //  fieldName: "inp-name",
    // });
    const bodyobjectjson = JSON.stringify(looksUps);
    //console.log(bodyobjectjson);
    xhrcall(
      0,
      apiUrl + "lookups",
      bodyobjectjson,
      "json",
      "",
      checkForeignDone
    );
  }

  function checkForeignDone(response) {
    response = JSON.parse(response);
    const data = response.data;
    Object.keys(data).forEach((fieldName) => {
      const selectEl = document.getElementById(fieldName);
      if (!selectEl) return;

      const firstOption = document.createElement("option");
      firstOption.value = "";
      firstOption.textContent = "Please Select";
      selectEl.innerHTML = "";
      selectEl.appendChild(firstOption);

      data[fieldName].forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        selectEl.appendChild(option);
      });

      // Restore selected value if we have editData
      const cleanName = fieldName.replace(/^inp-/, "");
      $(".selectpicker").selectpicker("refresh");
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const formatted = `${yyyy}-${mm}-${dd}`;

      $(".datepicker").val(formatted); // set default value
      $(".datepicker")
        .datepicker({
          format: "yyyy-mm-dd",
          autoclose: true,
          todayHighlight: true,
        })
        .datepicker("setDate", formatted); // sets highlighted date
      // }
    });
  }
}

document
  .getElementById("btn-create")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form submission

    const formData = new FormData(document.querySelector("form"));

    // Create a plain object from FormData and remove the 'inp-' prefix
    const formDataObject = {};
    let submitIt = true;

    formData.forEach((value, key) => {
      const cleanedKey = key.replace(/^inp-/, "");
      if (cleanedKey !== "image") formDataObject[cleanedKey] = value.trim();

      const field = document.getElementById("inp-" + cleanedKey);
      let isValid = checkField(field, cleanedKey, value);
      if (isValid === false) submitIt = false;
    });
    // 👉 Include Quill editor data
    Object.entries(quillEditors).forEach(([key, quillInstance]) => {
      const cleanedKey = key.replace(/^inp-/, "");
      const value = quillInstance.root.innerHTML;
      formDataObject[cleanedKey] = value; // 👈 cleanedKey instead of fieldName
      //check the field
      let isValid = checkQuill(value, key, quillInstance);
      if (isValid === false) submitIt = false;
    });

    // Overwrite the upload if it's an image
    if (cfImageDetails) {
      formDataObject.image = cfImageDetails.filename;
      formDataObject.cfid = cfImageDetails.id;
      formDataObject.cfImageUrl = cfImageDetails.variants[0];
      formDataObject.isCfImageDraft = 0;
    }

    // Submit if all validations pass
    if (submitIt === true) {
      const requestBody = JSON.stringify(formDataObject);
      const theUrl = apiUrl + `tables/${tableName}`;
      xhrcall(0, theUrl, requestBody, "json", "", getAddDone);
    }
  });

let getAddDone = (response) => {
  response = JSON.parse(response);
  if (response.status == "ok") showAlert("Record Added", 1);
  else showAlert(response.error, 2);
};

/**
 * Show an error message for a field
 */

let whenDocumentReady = (f) => {
  /in/.test(document.readyState)
    ? setTimeout("whenDocumentReady(" + f + ")", 9)
    : f();
};

whenDocumentReady(
  (isReady = () => {
    //check the fields for data_foreigntable
    checkForeign();
    //check for a one time URL
    const imageTrueEl = document.getElementById("imageTrue");

    //get a one time URL. is it wise to call this everytime?
    if (imageTrueEl && imageTrueEl.value === "true") {
      let getOnTimeTokenDone = (response) => {
        response = JSON.parse(response);
        if (response.url != "") {
          //store the URL
          oneTimeUrl = response.url;
          //delete the element
          imageTrueEl.remove();
        }
      };

      const theUrl = apiUrl + `getonetimetoken`;
      xhrcall(1, theUrl, "", "json", "", getOnTimeTokenDone);
    }
    // Show the table
    document.getElementById("showBody").classList.remove("d-none");
  })
);
