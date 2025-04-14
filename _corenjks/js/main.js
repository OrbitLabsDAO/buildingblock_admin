let redirectUrl = ""; // hold the redcirect URL
let token;
let user;
//var table // datatable

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

let showElements = () => {
  const user = JSON.parse(window.localStorage.user);
  if (user.isAdmin == 1)
    document.getElementById("btn-create-cy").classList.remove("d-none");
  // Show the table
  document.getElementById("showBody").classList.remove("d-none");
};

//this function checks if an element exits
let checkElement = (element) => {
  let checkedElement = document.getElementById(element);
  //If it isn't "undefined" and it isn't "null", then it exists.
  if (typeof checkedElement != "undefined" && checkedElement != null) {
    return true;
  } else {
    return false;
  }
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

const fileInput = document.getElementById("inp-image");

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

let removeImage = () => {
  fileInput.value = "";
  document.getElementById("image-div").classList.remove("d-none");
  document.getElementById("upload-image-div").classList.add("d-none");
  document.getElementById("upload-image-text").innerText = "";
};

//TODO can this be moved into checkField ?
let uploadImage = (elm) => {
  //check that an image has been selected

  if (document.getElementById("inp-" + elm).files.length == 0) {
    //show error message
    showFieldError(elm, "An Image is required.");
    //disable the create button
    if (checkElement("btn-create"))
      document.getElementById("btn-create").disabled = true;
    if (checkElement("btn-update"))
      document.getElementById("btn-update").disabled = true;
  } else {
    document.getElementById("image-div").classList.add("d-none");
    document.getElementById("upload-image-div").classList.add("d-none");
    document.getElementById("image-preview-div").classList.remove("d-none");
    let dots = 3;
    let interval = setInterval(() => {
      dots = (dots + 1) % 4;
      document.getElementById("image-uploading-text").innerText =
        "Image uploading" + Array(dots).fill(".").join("");
    }, 1000);
    //TODO move thos to the done
    //document.getElementById("btn-create").disabled = false;
    hideFieldError(elm);
    //upload the image
    // xhrcall(1, apiUrl + "admin/image/", "", "", "", imageUploadDone, token);
  }
};

function checkField(field, cleanedKey, value) {
  let isValid = true;

  // Check if the field is required (based on 'required' attribute)
  if (field) {
    //TODO make sure this uses the correct image input and not hardcode as this will not work with multipile images
    if (field.name == "inp-image") {
      if (field.files.length == 0) {
        //show error message
        showFieldError(cleanedKey, "An Image is required.");
      } else {
        hideFieldError(cleanedKey);
      }
      return isValid;
    }

    if (field.tagName === "SELECT") {
      if (field.selectedIndex === 0) {
        isValid = false;
        showFieldError(cleanedKey, "This field is required.");
      } else hideFieldError(cleanedKey);
      return isValid;
    } else {
      if (
        field.required == true &&
        field.value === "" &&
        field.tagName != "SELECT"
      ) {
        isValid = false;
        return isValid;
        showFieldError(cleanedKey, "This field is required.");
      } else {
        hideFieldError(cleanedKey);
      }
    }
    // Email validation (if the field name contains "email")
    if (cleanedKey.toLowerCase().includes("email")) {
      if (validateEmail(value) == false) {
        isValid = false;
        showFieldError(cleanedKey, "Please enter a valid email address.");
      } else {
        hideFieldError(cleanedKey);
      }
      return isValid;
    }

    // Basic integer validation
    if (field && field.type === "number") {
      if (isNaN(value) || value.trim() === "") {
        isValid = false;
        showFieldError(cleanedKey, "Please enter a valid integer.");
      } else {
        hideFieldError(cleanedKey);
      }
      return isValid;
    }

    // Email validation (if the field name contains "email")
    if (cleanedKey.toLowerCase().includes("email")) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
      if (!emailPattern.test(value)) {
        isValid = false;
        showFieldError(cleanedKey, "Please enter a valid email address.");
      } else {
        hideFieldError(cleanedKey);
      }
      return isValid;
    }
    return isValid;
  }
}

function showFieldError(fieldName, message) {
  const errorElement = document.getElementById("error-" + fieldName);
  const fieldElement = document.getElementById("inp-" + fieldName);
  if (errorElement) {
    // Focus on the field with the error
    fieldElement.focus();
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
let validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

let goBack = () => {
  history.back();
};

let showAlert = (message, alertType, timeoutBool = 1) => {
  let alertEl;
  //set the alert type
  if (alertType == 1) alertEl = document.getElementById("accountsSuccess");
  if (alertType == 2) alertEl = document.getElementById("accountsDanger");
  //set the message
  alertEl.innerHTML = message;
  //remove the class
  alertEl.classList.remove("d-none");
  alertEl.offsetTop; //Getting Y of target element
  window.scrollTo(0, top);
  //clear it after 5 seconds
  if (timeoutBool == 1)
    alertTimeout = setTimeout(function () {
      alertEl.classList.add("d-none");
    }, 5000);
};

/* 

start of global account stuff

Ideally this should live in accounts.js but seeing as require it on every page we put it here instead otherwise we would have
to include accounts.js and app.js in every page

*/

let getToken = () => {
  token = window.localStorage.token;
  if (token != "" && token != undefined) {
    return token;
  } else {
    return "";
  }
};

let checkLogin = () => {
  //check if it is not a login page
  if (
    window.location.pathname == "/create-account" ||
    window.location.pathname == "/create-account/" ||
    window.location.pathname == "login" ||
    window.location.pathname == "/login/" ||
    window.location.pathname == "/forgot-password" ||
    window.location.pathname == "/forgot-password/"
  ) {
    //window.location = '/'
  } else {
    //get the user object
    let tmpUser = window.localStorage.user;
    //check it exists
    if (tmpUser != undefined) {
      //decode the json
      user = JSON.parse(window.localStorage.user);

      //check admin stuff
      if (user.isAdmin == 1) {
        //if (checkElement("btn-create-cy") == true)
        // document.getElementById('btn-create-cy').classList.remove("d-none");
        document.getElementById("hideAdmin").classList.remove("d-none");
      } else {
        //delete the html node
        document.getElementById("hideAdmin").remove();
      }

      //check the user is logged in some one could spoof this so we could do a valid jwt check here
      //but i prefer to do it when we ping the api for the data for this user.
      if (user.loggedin != 1) {
        window.location = "/login";
      } else {
        //clear the cache
        //clearCache();
        //set the jwt and user
        getToken();
        if (checkElement("user-account-header") == true) {
          //if (typeof(checkElement) != 'undefined' && checkElement != null) {
          if (user.username != "" && user.username != undefined)
            document.getElementById("user-account-header").innerHTML =
              user.username;
          else
            document.getElementById("user-account-header").innerHTML =
              user.email;
        }
      }
    } else {
      window.location = "/login/";
    }

    //check if they are on an admin page, this is a JS check so it is not optimal but it will do for now
    if (user.isAdmin == 0) {
      console.log(window.location.pathname);
      if (
        window.location.pathname == "/tables/adminuser/" ||
        window.location.pathname == "/tables/adminuser/add" ||
        window.location.pathname == "/tables/adminuser/edit"
      )
        window.location = "/dashboard/";
    }
  }
};

let clearCache = (clearUser = 0) => {
  if (clearUser == 1) {
    window.localStorage.token = "";
    window.localStorage.user = "";
    window.localStorage.settings = "";
  }
};

/* 
end of global account stuff
*/

let getUrlParamater = (param) => {
  let searchParams = new URLSearchParams(window.location.search);
  let res = searchParams.has(param); // true
  if (res != false) return searchParams.get(param);
  else return "";
};

//this function makes the XHR calls.

let xhrcall = async (
  type = 1,
  method,
  bodyObj = "",
  setHeader = "",
  redirectUrl = "",
  callback = ""
) => {
  //debug
  //console.log(apiUrl)
  //console.log(bodyObj)
  //console.log(method)
  //console.log(callback)

  //get  auth token if it is blank
  const auth = getToken();

  //checkElement = document.getElementById("spinner");
  if (checkElement("spinner") == true) {
    //if (typeof(checkElement) != 'undefined' && checkElement != null) {
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
    if (checkElement("confirmation-modal-delete-button") == true) {
      //checkElement = document.getElementById("confirmation-modal-delete-button");
      //if (typeof(checkElement) != 'undefined' && checkElement != null) {
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
