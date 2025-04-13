//TODO add the btn update code back
//TODO check check fields part still works
const url = new URL(window.location.href);
let parts = url.pathname.split("/").filter(Boolean);
let tableName = parts.length > 1 ? parts[parts.length - 2] : null;
let id = url.searchParams.get("id");
let editData = "";
let foreignData = "";

function getData(callback) {
  let getTableDone = (response) => {
    response = JSON.parse(response);
    if (response.data.length > 0) {
      editData = response.data[0];
    }
    if (typeof callback === "function") callback();
  };

  let theUrl = apiUrl + `tables/${tableName}`;
  if (id != null) theUrl += `?id=${id}`;
  xhrcall(1, theUrl, "", "json", "", getTableDone);
}

function checkForeign(callback) {
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
    );

  if (looksUps.length > 0) {
    const bodyobjectjson = JSON.stringify(looksUps);
    xhrcall(
      0,
      apiUrl + "lookups",
      bodyobjectjson,
      "json",
      "",
      function checkForeignDone(response) {
        response = JSON.parse(response);
        foreignData = response.data;

        Object.keys(foreignData).forEach((fieldName) => {
          const selectEl = document.getElementById(fieldName);
          if (!selectEl) return;

          selectEl.innerHTML = "";
          const defaultOption = document.createElement("option");
          defaultOption.value = "";
          defaultOption.textContent = "Please Select";
          selectEl.appendChild(defaultOption);

          foreignData[fieldName].forEach((item) => {
            const option = document.createElement("option");
            option.value = item.id;
            option.textContent = item.name;
            selectEl.appendChild(option);
          });
        });

        if (typeof callback === "function") callback();
      }
    );
  } else {
    if (typeof callback === "function") callback(); // still run if no lookups
  }
}
function applyFormValues() {
  if (!editData || !foreignData) return;

  document.querySelectorAll("input, select, textarea").forEach((field) => {
    const rawName = field.name; // e.g. inp-adminId
    const baseName = rawName.replace(/^inp-/, ""); // adminId
    const relatedKey = baseName.endsWith("Id")
      ? baseName.slice(0, -2) // remove trailing 'Id' => 'admin'
      : baseName;

    // Apply normal values from editData
    if (editData.hasOwnProperty(baseName)) {
      field.value = editData[baseName];
    }

    // Handle select inputs with foreign data
    if (field.tagName === "SELECT") {
      const targetValue = editData[relatedKey];
      const optionsList = foreignData[rawName]; // still using full raw field name here (e.g., inp-adminId)

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

  document.getElementById("showBody").classList.remove("d-none");
}

function whenDocumentReady(f) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", f);
  } else {
    f();
  }
}

// Make sure the page is ready before starting the data retrieval and form population
whenDocumentReady(() => {
  getData(() => {
    checkForeign(() => {
      applyFormValues();
    });
  });
});
