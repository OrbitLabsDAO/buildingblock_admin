const url = new URL(window.location.href);
let parts = url.pathname.split("/").filter(Boolean);
let tableName = parts.length > 1 ? parts[parts.length - 2] : null;
let id = url.searchParams.get("id");
let editData = "";
let foreignData = "";

async function getOneTimeUrl(callback) {
  //check for a one time URL
  const imageTrueEl = document.getElementById("imageTrue");
  //get a one time URL. is it wise to call this everytime?
  if (imageTrueEl && imageTrueEl.value === "true") {
    //make the call
    const theUrl = apiUrl + `getonetimetoken`;
    const res = await xhrcall2(1, theUrl, "", "json", "", "");
    if (res.url != "") {
      imageTrueEl.remove();
      return res.url;
    } else return "";
  }
}

async function getData(callback) {
  let theUrl = apiUrl + `tables/${tableName}`;
  if (id != null) theUrl += `?id=${id}`;
  const res = await xhrcall2(1, theUrl, "", "json", "", "");
  if (res.data.length > 0) return res.data[0];
  else return "";
}

async function checkForeign() {
  const lookups = Array.from(
    document.querySelectorAll("[data-foreigntable][data-foreignid]")
  )
    .map((field) => {
      const foreignTable = field.getAttribute("data-foreigntable");
      const foreignId = field.getAttribute("data-foreignid");
      const fieldName = field.name;
      return { foreignTable, foreignId, fieldName };
    })
    .filter(
      ({ foreignTable, foreignId, fieldName }) =>
        foreignTable && foreignId && fieldName
    );
  if (lookups.length === 0) return {};

  try {
    const res = await xhrcall2(
      0,
      "lookups",
      JSON.stringify(lookups),
      "json",
      "",
      ""
    );
    const foreignData = res.data;
    Object.entries(foreignData).forEach(([fieldName, items]) => {
      const selectEl = document.getElementById(fieldName);
      if (!selectEl) return;

      selectEl.innerHTML = "";
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Please Select";
      selectEl.appendChild(defaultOption);

      items.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        selectEl.appendChild(option);
      });
    });

    return foreignData;
  } catch (error) {
    console.error("Error loading foreign data:", error);
    return {};
  }
}

const quills = [];

document.querySelectorAll(".editor").forEach((editorEl, index) => {
  const quill = new Quill(editorEl, {
    theme: "snow",
  });
  quills.push(quill);
});

function applyFormValues() {
  console.log(editData);
  if (!editData || !foreignData) return;

  document;
  document
    .querySelectorAll(
      'input[type="number"], input[data-type="varchar"], select, textarea'
    )
    .forEach((field) => {
      const rawName = field.name; // e.g. inp-userId
      const baseName = rawName.replace(/^inp-/, ""); // userId
      const relatedKey = baseName.endsWith("Id")
        ? baseName.slice(0, -2) // remove trailing 'Id' => 'admin'
        : baseName;

      // Apply normal values from editData
      if (editData.hasOwnProperty(baseName)) {
        if (baseName == "cfImageUrl") {
          document.getElementById("image-uploading-text").innerText =
            "Image preview";
          document.getElementById("image-preview").src = editData[baseName];
        } else {
          field.value = editData[baseName];
        }
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

      let isValid = checkField(field, cleanedKey, value);
      if (isValid == false) submitIt = false;
    });
    console.log(field.name);
    //over ride the upload as its an image
    if (cfImageDetails) {
      formDataObject.image = cfImageDetails.filename;
      formDataObject.cfid = cfImageDetails.id;
      formDataObject.cfImageUrl = cfImageDetails.variants[0];
      formDataObject.isCfImageDraft = 0;
    }

    // Proceed if all validations pass
    if (submitIt == true) {
      let getEditDone = (response) => {
        response = JSON.parse(response);
        console.log(response);
        if (response.status == "ok") {
          showAlert("Record Updated", 1);
        } else {
          showAlert("Error updating record, please try again", 2);
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

function whenDocumentReady() {
  return new Promise((resolve) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", resolve);
    } else {
      resolve();
    }
  });
}

const initForm = async () => {
  await whenDocumentReady();
  oneTimeUrl = await getOneTimeUrl();
  editData = await getData();
  foreignData = await checkForeign();
  applyFormValues(); // this relies on the above being done
  document.getElementById("showBody").classList.remove("d-none");
};

// Make sure the page is ready before starting the data retrieval and form population
whenDocumentReady().then(() => {
  initForm();
});
