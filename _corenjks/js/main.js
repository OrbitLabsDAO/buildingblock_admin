let redirectUrl = ""; // hold the redcirect URL
let token;
let user;
let oneTimeUrl = "";
let cfImageDetails;
let interval;
//TODO rename this to theData as its used in all views now
let theData = "";
let foreignData = "";

// Step 1: Get all collapse containers and links
const collapses = document.querySelectorAll('[id^="collapse"]');
const allMenuLinks = document.querySelectorAll(".collapse-item");

// Step 2: Track which collapse to expand
let activeCollapse = null;

// Step 3: Set active menu item and find which collapse it's inside
allMenuLinks.forEach((link) => {
  const href = link.getAttribute("href")?.toLowerCase();
  const matches = href?.includes(`/tables/${tableName.toLowerCase()}/`);

  if (matches) {
    link.classList.add("active");

    // Traverse up to find the collapse div
    let current = link.parentElement;
    while (current && !current.classList.contains("collapse")) {
      current = current.parentElement;
    }

    if (current) {
      activeCollapse = current;
    }
  } else {
    link.classList.remove("active");
  }
});

// Step 4: Expand only the active collapse and collapse others
collapses.forEach((collapse) => {
  if (collapse === activeCollapse) {
    collapse.classList.add("show");
    collapse.removeAttribute("data-parent"); // optional: keeps it open
  } else {
    collapse.classList.remove("show");
  }
});

//TODO: replace this with plain js
(function ($) {
  "use strict"; // Start of use strict
  // Toggle the side navigation
  $("#sidebarToggle, #sidebarToggleTop").on("click", function (e) {
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
    if ($(".sidebar").hasClass("toggled")) {
      $(".sidebar .collapse").collapse("hide");
    }
  });

  // Close any open menu accordions when window is resized below 768px
  $(window).resize(function () {
    if ($(window).width() < 768) {
      $(".sidebar .collapse").collapse("hide");
    }

    // Toggle the side navigation when window is resized below 480px
    if ($(window).width() < 480 && !$(".sidebar").hasClass("toggled")) {
      $("body").addClass("sidebar-toggled");
      $(".sidebar").addClass("toggled");
      $(".sidebar .collapse").collapse("hide");
    }
  });

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  $("body.fixed-nav .sidebar").on(
    "mousewheel DOMMouseScroll wheel",
    function (e) {
      if ($(window).width() > 768) {
        var e0 = e.originalEvent,
          delta = e0.wheelDelta || -e0.detail;
        this.scrollTop += (delta < 0 ? 1 : -1) * 30;
        e.preventDefault();
      }
    }
  );

  // Scroll to top button appear
  $(document).on("scroll", function () {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $(".scroll-to-top").fadeIn();
    } else {
      $(".scroll-to-top").fadeOut();
    }
  });

  // Smooth scrolling using jQuery easing
  $(document).on("click", "a.scroll-to-top", function (e) {
    var $anchor = $(this);
    $("html, body")
      .stop()
      .animate(
        {
          scrollTop: $($anchor.attr("href")).offset().top,
        },
        1000,
        "easeInOutExpo"
      );
    e.preventDefault();
  });
})(jQuery); // End of use strict

//set up quill editors
const quillEditors = {};

document.querySelectorAll(".editor").forEach((editorEl) => {
  const id = editorEl.id.replace(/^inp-/, ""); // e.g. 'address1'
  const quill = new Quill(editorEl, { theme: "snow" });
  quillEditors[id] = quill;
});

/**
 * Displays elements based on user permissions
 */
let showElements = () => {
  // Retrieve the user object from localStorage
  const user = JSON.parse(window.localStorage.user);

  // Check if the user is an admin
  if (user.isAdmin == 1) {
    // Show the "Create a Cycle" button if the user is an admin
    document.getElementById("btn-create-cy").classList.remove("d-none");
  }

  // Show the main content table
  document.getElementById("showBody").classList.remove("d-none");
};

//this function checks if an element exits
let checkElement = (selector) => {
  // If it starts with "#", treat as ID
  if (selector.startsWith("#")) {
    const el = document.getElementById(selector.slice(1));
    return el !== null;
  }

  // If it starts with ".", treat as class
  if (selector.startsWith(".")) {
    const els = document.querySelectorAll(selector);
    return els.length > 0;
  }

  // Otherwise, treat as tag or general selector
  const els = document.querySelectorAll(selector);
  return els.length > 0;
};

//check the password
/*
note this this the password checker curently it checks to the following rule set.
To check a password between 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter

*/
let checkPassword = (str) => {
  if (complexPassword == 0) {
    return true;
  } else {
    var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(str);
  }
};

let showPassword = (elementName, eyeNumber) => {
  let theElement = document.getElementById(elementName);
  if (theElement.type === "password") {
    theElement.type = "text";
    document
      .getElementById("show-password" + eyeNumber)
      .classList.add("d-none");
    document
      .getElementById("hide-password" + eyeNumber)
      .classList.remove("d-none");
  } else {
    theElement.type = "password";
    document
      .getElementById("hide-password" + eyeNumber)
      .classList.add("d-none");
    document
      .getElementById("show-password" + eyeNumber)
      .classList.remove("d-none");
  }
};

//check for a file to be selected
let fileInput;
if (checkElement("#inp-image")) {
  fileInput = document.getElementById("inp-image");

  fileInput.addEventListener("change", function (event) {
    if (fileInput.files.length > 0) {
      //console.log("File selected:", fileInput.files[0].name);
      document.getElementById("image-div").classList.add("d-none");
      document.getElementById("upload-image-div").classList.remove("d-none");
      document.getElementById("upload-image-text").innerText =
        fileInput.files[0].name;
    } else {
      //console.log("No file selected.");
      document.getElementById("image-div").classList.remove("d-none");
      document.getElementById("upload-image-div").classList.add("d-none");
      document.getElementById("upload-image-text").innerText = "";
    }
  });
}

let removeImage = () => {
  fileInput.value = "";
  document.getElementById("image-div").classList.remove("d-none");
  document.getElementById("upload-image-div").classList.add("d-none");
  document.getElementById("upload-image-text").innerText = "";
};

let uploadImage = (elm) => {
  //check that an image has been selected
  let imageUploadDone = (response) => {
    response = JSON.parse(response);
    if (response.success == true) {
      document.getElementById("image-preview").classList.remove("d-none");
      if (checkElement(document.getElementById("btn-create")))
        document.getElementById("btn-create").disabled = false;
      if (checkElement(document.getElementById("btn-update")))
        document.getElementById("btn-update").disabled = false;

      //stop the interval
      clearInterval(interval);
      document.getElementById("image-uploading-text").innerText =
        "Image Preview";
      //show the preview
      document.getElementById("image-preview").src =
        response.result.variants[0];
      //store the details
      cfImageDetails = response.result;
    }
  };

  if (document.getElementById("inp-" + elm).files.length == 0) {
    //show error message
    showFieldError(elm, "An Image is required.");
    //disable the create button
    if (checkElement("#btn-create"))
      document.getElementById("btn-create").disabled = true;
  } else {
    if (checkElement(document.getElementById("btn-update")))
      document.getElementById("image-div").classList.add("d-none");
    document.getElementById("upload-image-div").classList.add("d-none");
    document.getElementById("image-preview-div").classList.remove("d-none");
    document.getElementById("image-preview").classList.add("d-none");
    let dots = 3;
    interval = setInterval(() => {
      dots = (dots + 1) % 4;
      document.getElementById("image-uploading-text").innerText =
        "Image uploading" + Array(dots).fill(".").join("");
    }, 1000);

    hideFieldError(elm);
    //upload the image
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    xhrcall(0, oneTimeUrl, formData, "", "", imageUploadDone, "");
  }
};

//TODO : make this work for more than one map by using classes
/*
TEST 

https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d158858.58518374225!2d-0.2664025124317395!3d51.52852620465898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a00baf21de75%3A0x52963a5addd52a99!2sLondon%2C%20UK!5e0!3m2!1sen!2sth!4v1745296125738!5m2!1sen!2sth

https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.2132298427973!2d-0.135661122882682!3d51.52764877181792!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761bccc506725f%3A0x3bb9e6e4b6391e8e!2sLondon%20Euston%20Station!5e0!3m2!1sen!2sth!4v1745339657701!5m2!1sen!2sth

*/
const mapInput = document.getElementById("inp-map");

if (mapInput) {
  document
    .getElementById("inp-map")
    .addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // prevent form submission
        const isValid = checkField(this, "map", this.value);
        if (isValid) {
          document.getElementById("inp-map-view").classList.remove("d-none");
          document.getElementById("inp-map-view").src = this.value;
          document.getElementById("map-view").classList.remove("d-none");
        }
      }
    });
}
/**
 * Check if a Quill editor is valid.
 *
 * @param {string} value The value of the Quill editor.
 * @param {string} cleanedKey The cleaned key of the Quill editor.
 * @param {object} quillInstance The Quill instance.
 *
 * @return {boolean} True if the Quill editor is valid, false otherwise.
 */
function checkQuill(value, cleanedKey, quillInstance) {
  // Get the container element
  const container = quillInstance.root.closest(".ql-container");

  // Check if the Quill editor is required
  const isRequired =
    container?.hasAttribute("required") ||
    container?.getAttribute("required") !== null;

  // Check if the Quill editor is empty
  if (isRequired && (value.trim() === "" || value === "<p><br></p>")) {
    // Show an error message
    showFieldError(cleanedKey, "This field is required.");
    return false;
  } else {
    // Hide any error messages
    hideFieldError(cleanedKey);
  }

  // Return true if the Quill editor is valid
  return true;
}

foreignData = "";

/**
 * Retrieves a one-time URL token if the "imageTrue" element is present and its value is "true".
 * Makes an API call to obtain the token and removes the "imageTrue" element upon success.
 *
 * @param {Function} callback - A callback function to handle the returned URL.
 * @returns {Promise<string>} The one-time URL token if available, otherwise an empty string.
 */

/**
 * Retrieves a one-time URL token if the "imageTrue" element is present and its value is "true".
 * Makes an API call to obtain the token and removes the "imageTrue" element upon success.
 *
 * @returns {Promise<string>} The one-time URL token if available, otherwise an empty string.
 */
async function getOneTimeUrl(callback) {
  // Get the element with ID "imageTrue" from the DOM
  const imageTrueEl = document.getElementById("imageTrue");

  // Check if the element exists and its value is "true"
  if (imageTrueEl && imageTrueEl.value === "true") {
    // Construct the URL for the API call
    const theUrl = apiUrl + `getonetimetoken`;

    // Make an asynchronous GET request to obtain the token
    const res = await xhrcall2(1, theUrl, "", "json", "", "");

    // If a URL is returned in the response
    if (res.url != "") {
      // Remove the "imageTrue" element from the DOM
      imageTrueEl.remove();

      // Return the obtained URL
      return res.url;
    } else {
      // Return an empty string if no URL is received
      return "";
    }
  }

  // Return an empty string if "imageTrue" element is absent or value is not "true"
  return "";
}

/**
 * Retrieves the data for the specified table and ID.
 * Makes an API call to obtain the data and returns it in JSON format.
 *
 * @param {Function} [callback] - A callback function to handle the returned data.
 * @returns {Promise<Object>} The retrieved data in JSON format, or an empty object if no data is found.
 */

//TODO can we remove the callback?
async function getData(retunrnOne = true) {
  // Construct the URL for the API call
  let theUrl = apiUrl + `tables/${tableName}`;

  // Add the ID to the URL if it is available
  if (id != null) theUrl += `?id=${id}`;

  // Make an asynchronous GET request to obtain the data
  const res = await xhrcall2(1, theUrl, "", "json", "", "");

  // If data is returned in the response
  if (res.data.length > 0) {
    // Return the first item or the whole data array
    if (retunrnOne == true) return res.data[0];
    else return res.data;
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
/**
 * Applies values from the `theData` object to the form fields.
 * Supports fields of types:
 *  - input[type="number"]
 *  - input[data-type="varchar"]
 *  - input.datepicker
 *  - select
 *  - textarea
 *  - Quill editor (if present)
 *
 * If a field has a Quill editor, its HTML is used to populate the field.
 * The `foreignData` object is used to populate select dropdowns.
 */
function applyFormValues() {
  if (!theData || !foreignData) return;

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

      // Apply the value from the theData object if it exists
      if (theData.hasOwnProperty(baseName)) {
        const value = theData[baseName];

        // Handle datepicker separately
        if (field.classList.contains("datepicker")) {
          const parsedDate = new Date(value);
          if (!isNaN(parsedDate)) {
            // Format for the datepicker plugin: yyyy/mm/ddd
            const formattedDate = `${parsedDate.getFullYear()}/${String(
              parsedDate.getMonth() + 1
            ).padStart(2, "0")}/${String(parsedDate.getDate()).padStart(
              2,
              "0"
            )}`;
            console.log(formattedDate);
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
        const targetValue = theData[relatedKey];
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
        document.getElementById("inp-map-view").src = theData[baseName];
      }
    });

  // Populate any Quill editors
  Object.entries(quillEditors).forEach(([fieldName, quillInstance]) => {
    if (theData.hasOwnProperty(fieldName)) {
      quillInstance.root.innerHTML = theData[fieldName];
    }
  });

  $(".selectpicker").selectpicker("refresh");
}

/**
 * Checks if a field is valid.
 *
 * @param {object} field The input field element.
 * @param {string} cleanedKey The cleaned key of the field.
 * @param {string} value The value of the field.
 *
 * @return {boolean} True if the field is valid, false otherwise.
 */
function checkField(field, cleanedKey, value) {
  let isValid = true;

  if (!field) return true;

  // Special case: image
  if (field.name === "inp-image") {
    if (field.files.length === 0) {
      showFieldError(cleanedKey, "An image is required.");
      isValid = false;
    } else {
      hideFieldError(cleanedKey);
    }
    return isValid;
  }

  // Select
  if (field.tagName === "SELECT") {
    if (field.selectedIndex === 0 && field.required) {
      showFieldError(cleanedKey, "This field is required.");
      isValid = false;
    } else {
      hideFieldError(cleanedKey);
    }
    return isValid;
  }

  // Required field
  if (field.required && value.trim() === "") {
    showFieldError(cleanedKey, "This field is required.");
    return false;
  } else {
    hideFieldError(cleanedKey);
  }

  // Email
  if (
    cleanedKey.toLowerCase().includes("email") ||
    field.dataset.type === "email"
  ) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      showFieldError(cleanedKey, "Please enter a valid email address.");
      isValid = false;
    } else {
      hideFieldError(cleanedKey);
    }
    return isValid;
  }

  // Number/integer
  if (field.type === "number" || field.dataset.type === "integer") {
    if (isNaN(value) || value.trim() === "") {
      showFieldError(cleanedKey, "Please enter a valid number.");
      isValid = false;
    } else {
      hideFieldError(cleanedKey);
    }
    return isValid;
  }

  // Phone number
  if (
    cleanedKey.toLowerCase().includes("phone") ||
    cleanedKey.toLowerCase().includes("mobile") ||
    cleanedKey.toLowerCase().includes("telephone") ||
    field.dataset.type === "tel"
  ) {
    const phonePattern = /^\+?[0-9\s\-()]{7,20}$/; // Accepts +66, (123), 123-4567, 0123456789 etc.
    if (!phonePattern.test(value)) {
      showFieldError(cleanedKey, "Please enter a valid phone number.");
      isValid = false;
    } else {
      hideFieldError(cleanedKey);
    }
    return isValid;
  }

  // Map link
  if (
    cleanedKey.toLowerCase().includes("map") ||
    field.dataset.type === "map"
  ) {
    const googleMapPattern =
      /^https:\/\/(maps\.app\.goo\.gl|www\.google\.com\/maps)\//;
    if (!googleMapPattern.test(value.trim())) {
      showFieldError(cleanedKey, "Please enter a valid Google Maps link.");
      isValid = false;
    } else {
      hideFieldError(cleanedKey);
    }
    return isValid;
  }

  // Varchar
  //TODO replace this with a check based on the varchar size
  /*
  if (field.dataset.type === "varchar") {
    const maxLength = field.maxLength || 255;
    if (value.length > maxLength) {
      showFieldError(
        cleanedKey,
        `This field must be ${maxLength} characters or less.`
      );
      isValid = false;
    } else {
      hideFieldError(cleanedKey);
    }
    return isValid;
  }
  */

  return isValid;
}

/**
 * Show an error message for a field.
 *
 * @param {string} fieldName The name of the field to show the error message for.
 * @param {string} message The error message to show.
 */
function showFieldError(fieldName, message) {
  const errorElement = document.getElementById("error-" + fieldName);
  const fieldElement = document.getElementById("inp-" + fieldName);

  if (errorElement) {
    // Focus on the field with the error
    fieldElement.focus();

    // Show the error message
    errorElement.classList.remove("d-none");
    errorElement.textContent = message;
  }
}

/**
 * Hide the error message for a field
 */
function hideFieldError(fieldName) {
  const errorElement = document.getElementById("error-" + fieldName);
  if (errorElement) {
    errorElement.classList.add("d-none");
    errorElement.textContent = "";
  }
}

//this fucntion validates an email address.
/**
 * Validate an email address.
 *
 * @param {string} email The email address to validate.
 * @returns {boolean} true if the email address is valid, false otherwise.
 */
let validateEmail = (email) => {
  /**
   * Regular expression to validate an email address.
   * Source: https://stackoverflow.com/a/46181/1197418
   */
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

let goBack = () => {
  history.back();
};

/**
 * Displays an alert message to the user.
 *
 * @param {string} message - The message to display.
 * @param {number} alertType - The type of alert (1 for success, 2 for danger).
 * @param {boolean} [timeoutBool=1] - Whether to hide the alert after a timeout.
 */
let showAlert = (message, alertType, timeoutBool = 1) => {
  let alertEl;

  // Select the appropriate alert element based on the alert type
  if (alertType == 1) alertEl = document.getElementById("accountsSuccess");
  if (alertType == 2) alertEl = document.getElementById("accountsDanger");

  // Set the alert message
  alertEl.innerHTML = message;

  // Show the alert element
  alertEl.classList.remove("d-none");

  // Scroll to the top of the page to make the alert visible
  alertEl.offsetTop; // for triggering reflow
  window.scrollTo(0, top);

  // Hide the alert after 5 seconds if timeoutBool is true
  if (timeoutBool == 1) {
    alertTimeout = setTimeout(function () {
      alertEl.classList.add("d-none");
    }, 5000);
  }
};

/* 

start of global account stuff

Ideally this should live in accounts.js but seeing as require it on every page we put it here instead otherwise we would have
to include accounts.js and app.js in every page

*/

/**
 * Retrieves the authentication token from localStorage.
 *
 * @returns {string} The token if it exists, otherwise an empty string.
 */
let getToken = () => {
  // Retrieve token from localStorage
  token = window.localStorage.token;

  // Check if the token is not empty or undefined
  if (token != "" && token != undefined) {
    return token;
  } else {
    return "";
  }
};

/**
 * Checks if the user is logged in and if they are an admin.
 *
 * If the user is logged in and is an admin, the "Create Cycle" button is shown.
 * If the user is logged in but is not an admin, the "Create Cycle" button is hidden.
 * If the user is not logged in, the user is redirected to the login page.
 */
let checkLogin = () => {
  // Check if it is not a login page
  if (
    window.location.pathname == "/create-account" ||
    window.location.pathname == "/create-account/" ||
    window.location.pathname == "login" ||
    window.location.pathname == "/login/" ||
    window.location.pathname == "/forgot-password" ||
    window.location.pathname == "/forgot-password/"
  ) {
    // If it is a login page, do nothing
  } else {
    // Get the user object
    let tmpUser = window.localStorage.user;
    // Check if the user object exists
    if (tmpUser != undefined) {
      // Decode the JSON
      user = JSON.parse(window.localStorage.user);

      // Check if the user is an admin
      if (user.isAdmin == 1) {
        // Show the "Create Cycle" button if the user is an admin
        document.getElementById("hideAdmin").classList.remove("d-none");
      } else {
        // Hide the "Create Cycle" button if the user is not an admin
        document.getElementById("hideAdmin").classList.add("d-none");
      }

      // Check if the user is logged in
      if (user.loggedin != 1) {
        // If the user is not logged in, redirect to the login page
        window.location = "/login";
      } else {
        // If the user is logged in, clear the cache
        // clearCache();
        // Set the JWT and user
        getToken();
        // Set the user's name in the top right corner of the page
        if (checkElement("#user-account-header") == true) {
          if (user.username != "" && user.username != undefined)
            document.getElementById("user-account-header").innerHTML =
              user.username;
          else
            document.getElementById("user-account-header").innerHTML =
              user.email;
        }
      }
    } else {
      // If the user object does not exist, redirect to the login page
      window.location = "/login/";
    }

    // Check if the user is on an admin page
    if (user.isAdmin == 0) {
      console.log(window.location.pathname);
      if (
        window.location.pathname == "/tables/adminuser/" ||
        window.location.pathname == "/tables/adminuser/add" ||
        window.location.pathname == "/tables/adminuser/edit"
      )
        // If the user is not an admin and is on an admin page, redirect to the dashboard
        window.location = "/dashboard/";
    }
  }
};

/**
 * Clears the user's cache (localStorage).
 * @param {number} clearUser 1 to clear the user's token, user object, and settings, 0 to only clear the cache.
 */
let clearCache = (clearUser = 0) => {
  if (clearUser == 1) {
    // Clear the user's token
    window.localStorage.token = "";
    // Clear the user's object
    window.localStorage.user = "";
    // Clear the user's settings
    window.localStorage.settings = "";
  }
};

/* 
end of global account stuff
*/

/**
 * Retrieves a URL parameter.
 *
 * @param {string} param The name of the parameter to retrieve.
 * @returns {string} The value of the parameter if it exists, otherwise an empty string.
 */
let getUrlParamater = (param) => {
  let searchParams = new URLSearchParams(window.location.search);
  let res = searchParams.has(param); // true
  if (res != false) return searchParams.get(param);
  else return "";
};

//this function makes the XHR calls.

/**
 * Makes an XMLHttpRequest (XHR) call.
 *
 * @param {number} type Type of HTTP request (0 = POST, 1 = GET, 2 = PATCH, 3 = DELETE, 4 = PUT).
 * @param {string} method URL of the request.
 * @param {string} [bodyObj=""] Body of the request, if any.
 * @param {string} [setHeader=""] Header to set, if any.
 * @param {string} [redirectUrl=""] URL to redirect to after the request, if any.
 * @param {string} [callback=""] Callback function to call with the response, if any.
 * @returns {Promise} Promise that resolves with the response, or rejects with an error.
 */
let xhrcall2 = (
  type = 1,
  method,
  bodyObj = "",
  setHeader = "",
  redirectUrl = "",
  callback = ""
) => {
  return new Promise((resolve, reject) => {
    const auth = getToken();

    if (checkElement("#spinner") == true) {
      document.getElementById("spinner").classList.remove("d-none");
    }

    let url = method;
    if (!method.includes("http")) url = apiUrl + method;

    let xhrtype = ["POST", "GET", "PATCH", "DELETE", "PUT"][type] || "GET";

    const xhr = new XMLHttpRequest();
    xhr.open(xhrtype, url);

    if (setHeader === "json")
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    if (auth != "") xhr.setRequestHeader("Authorization", "Bearer " + auth);

    xhr.onerror = function () {
      if (xhr.status === 0)
        document.getElementById("spinner").classList.add("d-none");
      reject(new Error("Network error"));
    };

    xhr.onload = function () {
      document.getElementById("spinner").classList.add("d-none");

      let res = xhr.response;
      let errorMessage = "";

      try {
        res = JSON.parse(res);
      } catch (e) {
        // leave as-is if not JSON
      }

      if ([400, 403, 500, 401, 405, 205].includes(xhr.status)) {
        errorMessage = res?.error || "Server Error";
        showAlert(errorMessage, 2);
        reject(errorMessage);
        return;
      }

      if ([200, 201].includes(xhr.status)) {
        if (callback === "") {
          resolve(res); // ✅ this is what gets awaited
        } else {
          eval(callback(res));
          resolve(res); // still resolve so await continues
        }

        if (redirectUrl !== "") {
          window.location = redirectUrl;
        }
      } else {
        reject(res);
      }
    };

    xhr.send(bodyObj !== "" ? bodyObj : null);
  });
};
/**
 * Makes an XMLHttpRequest (XHR) call.
 *
 * @param {number} type Type of HTTP request (0 = POST, 1 = GET, 2 = PATCH, 3 = DELETE, 4 = PUT).
 * @param {string} method URL of the request.
 * @param {string} [bodyObj=""] Body of the request, if any.
 * @param {string} [setHeader=""] Header to set, if any.
 * @param {string} [redirectUrl=""] URL to redirect to after the request, if any.
 * @param {string} [callback=""] Callback function to call with the response, if any.
 * @returns {Promise} Promise that resolves with the response, or rejects with an error.
 */
let xhrcall = async (
  type = 1,
  method,
  bodyObj = "",
  setHeader = "",
  redirectUrl = "",
  callback = ""
) => {
  //get  auth token if it is blank
  const auth = getToken();

  if (checkElement("#spinner") == true) {
    document.getElementById("spinner").classList.remove("d-none");
  }
  let url = method;
  let result = method.includes("http");
  if (result == false) url = apiUrl + method;
  //store the type
  let xhrtype = "";
  switch (type) {
    case 0:
      xhrtype = "POST";
      break;
    case 1:
      xhrtype = "GET";
      break;
    case 2:
      xhrtype = "PATCH";
      break;
    case 3:
      xhrtype = "DELETE";
      break;
    case 4:
      xhrtype = "PUT";
      break;
    default:
      xhrtype = "GET";
      break;
  }

  //set the new http request
  let xhr = new XMLHttpRequest();
  xhr.open(xhrtype, url);

  //set the header if required
  //note (chris) this may have to be a switch
  if (setHeader == "json")
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  if (auth != "") xhr.setRequestHeader("Authorization", "Bearer " + auth);
  //send the body object if one was passed
  if (bodyObj !== "") {
    xhr.send(bodyObj);
  } else {
    xhr.send();
  }
  //result
  //check for a generic error this is usualy CORRS or something like it.
  xhr.onerror = function () {
    //console.log(xhr.status)
    //console.log(xhr.response)
    if (xhr.status == 0)
      document.getElementById("spinner").classList.add("d-none");
  };
  xhr.onload = function () {
    if (checkElement("#confirmation-modal-delete-button") == true) {
      document.getElementById("spinner").classList.add("d-none");
    }
    //check if its an error
    let res = xhr.response;
    let errorMessage = "";

    //check for errors
    if (xhr.status == 400 || xhr.status == 403 || xhr.status == 500) {
      document.getElementById("spinner").classList.add("d-none");
      //process the response
      res = JSON.parse(res);
      errorMessage = res.error;
      if (errorMessage == "") errorMessage = "Server Error";
    }
    if (xhr.status == 405 || xhr.status == 401 || xhr.status == 205) {
      //console.log(res);
      const tmp = JSON.parse(res);
      errorMessage = tmp.error;
    }

    if (errorMessage != "") {
      showAlert(errorMessage, 2);
    }

    //check if it was ok.
    if (xhr.status == 200 || xhr.status == 201) {
      if (callback == "") {
        console.log(res);
        return res;
      }
      //check if a redirecr url as passed.
      if (redirectUrl != "") {
        window.location = redirectUrl;
      } else {
        //console.log(res)
        //res = JSON.parse(res)
        //console.log(res);
        eval(callback(res));
      }
    }
  };
};

checkLogin();
