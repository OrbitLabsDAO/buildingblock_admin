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

/*
START OF TABLE PROCESSING FUCNTIONS
*/

let createPaymentLink = (userId, leadId, tranchesRequested, email) => {
  let leadPropertyDone = (res) => {
    res = JSON.parse(res);
    const theData = res.data[0];
    const amount = theData.tranchePrice * tranchesRequested;
    const xhr = new XMLHttpRequest();
    const name = `payment of ${tranchesRequested} tranche(s) for ${theData.name}`;
    xhr.open(
      "POST",
      `${payMeUrl}api/crypto/payment?userId=${userId}&foreignId=${leadId}&amount=${amount}&name=${name}`,
      true
    );
    xhr.onload = function () {
      //check it was ok

      let resMes = JSON.parse(this.response);
      if (this.status === 200) {
        let updateLeadDone = (res) => {
          //send the email
          let sendEmailDone = (res) => {
            showAlert(
              `Payment Link: ${payMeUrl}payment/?orderId=${resMes.orderId}`,
              1,
              0,
              1
            );
          };
          url =
            apiUrl +
            `admin/email?emailType=paymentLead&email=${email}&orderId=${resMes.orderId}&tranches=${tranchesRequested}&name=${theData.name}&total=${amount}`;
          xhrcall(1, url, "", "json", "", sendEmailDone, token);
        };

        //build the JSON
        let theJson = {
          id: leadId,
          orderId: resMes.orderId,
          orderUrl: `${payMeUrl}payment/?orderId=${resMes.orderId}`,
          state: 1,
        };
        //set the body
        let bodyObj = {
          table: "property_leads",
          tableData: theJson,
        };
        //make the body object
        let bodyObjectJson = JSON.stringify(bodyObj);
        //update the lead
        xhrcall(
          4,
          apiUrl + `database/table/`,
          bodyObjectJson,
          "json",
          "",
          updateLeadDone,
          token
        );
      }
    };
    xhr.send();
  };
  //get the property
  url =
    apiUrl +
    `database/table?tablename=property&fields=tranchePrice&recordId=${window.localStorage.currentDataItemId}`;
  xhrcall(1, url, "", "json", "", leadPropertyDone, token);
};

let addTableRow = (name, value, table) => {
  table = table + `<tr><th scope="row">${name}:</th><td>${value}</td></tr>`;
  return table;
};

let clearFormData = () => {
  let theElements = document.getElementsByClassName("form-control-user");
  //loop through the elements
  for (var i = 0; i < theElements.length; ++i) {
    if (theElements[i].disabled == false) theElements[i].value = "";
  }
};

let isValidHttpUrl = (string) => {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return true;
};

let getTodatsDate = () => {
  var d = new Date();
  //console.log(d)
  let theDay = d.getDate();
  if (theDay < 10) theDay = `0${theDay}`;

  let theMonth = d.getMonth() + 1;
  if (theMonth < 10) theMonth = `0${theMonth}`;

  let theHours = d.getHours();
  if (theHours < 10) theHours = `0${theHours}`;

  let theMinutes = d.getMinutes();
  if (theMinutes < 10) theMinutes = `0${theMinutes}`;

  let theSeconds = d.getSeconds();
  if (theSeconds < 10) theSeconds = `0${theSeconds}`;

  return `${d.getFullYear()}-${theMonth}-${theDay} ${theHours}:${theMinutes} ${theSeconds}`;
};

let processlocalDropDown = (theData, localDropDown, theValue) => {
  let theOptions = "";
  //console.log(localDropDown)
  if (localDropDown != "" && localDropDown != undefined) {
    //console.log(theValue)
    for (var i = 0; i < localDropDown.length; ++i) {
      if (theData.name == localDropDown[i].field) {
        //renderInp = 2;
        //console.log(localLookUp[i])
        for (var i2 = 0; i2 < localDropDown[i].values.length; ++i2) {
          let valueData = localDropDown[i].values[i2];
          let dispalyData = localDropDown[i].displayValues[i2];

          //console.log(valueData)
          //console.log(theValue)
          //console.log(dispalyData)

          if (valueData == theValue) selected = "selected";
          else selected = "";
          theOptions =
            theOptions +
            `<option value="${valueData}" ${selected}>${dispalyData}</option>`;
        }
      }
    }
  }
  //console.log(theOptions)
  return theOptions;
};

//replace the data from the server with the local data.
let processlocalReplace = (key, localReplace, theValue) => {
  //check if it is a look up
  if (localReplace != "" && localReplace != undefined) {
    //loop through the look up data
    for (var i2 = 0; i2 < localReplace.length; ++i2) {
      //check if it is the field we are being looked at
      let theData = localReplace[i2];
      //console.log(theData.field);
      //console.log(key)
      if (key == theData.field) {
        //set the value for checking
        let localTmpValue = theValue;
        //loop through the  data
        for (var i3 = 0; i3 < theData.values.length; ++i3) {
          ////check if the id matches the tempvalue we set
          if (theData.values[i3] == localTmpValue) {
            //replace it
            localTmpValue = theData.replaceValues[i3];
            //update the temp value so we can render it out.
            theValue = localTmpValue;
            break;
          }
        }
      }
    }
  }
  return theValue;
};

/*
This funtion handles the building of the form
*/

let buildFormElement = (theData, theValues = "") => {
  let disabled = "";
  let theType = "text";
  let required = "required";
  let visible = "";

  //console.log(theData);
  //console.log(theValues)
  //set the value
  let theValue = "";
  //check we have some values (create will not have any obvs)
  if (theValues != "") {
    //loop through the values
    for (const key in theValues) {
      //find a match to the schema name
      if (key == theData.name) {
        //store it
        theValue = theValues[key];
        //get the hell out of here.
        break;
      }
    }
  }

  //check for id and disable it
  if (theData.name == "id") {
    disabled = "disabled";
  }

  //check if we have to set the admin id
  if (theData.name == "adminId") {
    theValue = JSON.parse(window.localStorage.user);
    theValue = theValue.id;
    disabled = "disabled";
    visible = "d-none";
  }

  //check if its date paid and its a create new
  if (theData.name == "datePaid" && theValues == "") {
    var d = new Date();
    //console.log(d)
    let theDay = d.getDate();
    if (theDay < 10) theDay = `0${theDay}`;

    let theMonth = d.getMonth() + 1;
    if (theMonth < 10) theMonth = `0${theMonth}`;

    let theHours = d.getHours();
    if (theHours < 10) theHours = `0${theHours}`;

    let theMinutes = d.getMinutes();
    if (theMinutes < 10) theMinutes = `0${theMinutes}`;

    let theSeconds = d.getSeconds();
    if (theSeconds < 10) theSeconds = `0${theSeconds}`;

    theValue = `${d.getFullYear()}-${theMonth}-${theDay} ${theHours}:${theMinutes} ${theSeconds}`;
  }

  switch (theData.name) {
    case "id":
      disabled = "disabled";
      break;
    case "email":
      theType = "email";
      break;
    case "phone":
      theType = "tel";
  }

  //look for the foreing key and set the current data item.
  //note : this only works was level 1 data as the foreign key, they function below works with any foreign key
  //       if it is required then we can add it back.
  if (theSettings.foreignKey == theData.name) {
    theValue = window.localStorage.currentDataItemId;
    disabled = "disabled";
    visible = "d-none";
  }

  /*
    //check if their are any foeign keys to set
    if (window.localStorage.currentDataItem != "") {
        let currentItem = window.localStorage.currentDataItem;
        currentItem = JSON.parse(currentItem);
        for (const key in foreignKeys) {
            //console.log("KEY " + key);
            //console.log("FK " + foreignKeys[key]);
            for (const key2 in currentItem) {
                if (theData.name == foreignKeys[key]) {
                    //debug
                    //console.log('found')
                    //console.log(currentItem[key2]);
                    theValue = currentItem[key2];
                    disabled = "disabled";
                    visible = "d-none";
                    break;
                }

            }
        }

    }
    */

  //add a space before each upper case as we use camel case in the sql
  let theTitle = theData.name;
  theTitle = theTitle.replace(/([a-z])([A-Z])/g, "$1 $2");
  //captalise the element
  theTitle = theTitle.charAt(0).toUpperCase() + theTitle.slice(1);
  //remove any _
  theTitle = theTitle.replace("_", " ");
  //built the element
  let inpHtml = "";
  //store the render type
  //1 = input
  //2 = select
  let renderInp = 1;
  //set an options var
  let theOptions = "";
  //store the selected field
  let selected = "";
  //check if we have look up ids
  //todo : move this to its own function (new refactor)
  if (lookUpData != undefined) {
    if (lookUpData.length > 0) {
      //loop through the lookups
      for (var i = 0; i < lookUpData.length; ++i) {
        if (theData.name == lookUpData[i].key) {
          //console.log(lookUpData[i]);
          //console.log(theData.name);
          renderInp = 2;
          for (var i2 = 0; i2 < lookUpData[i].theData.length; ++i2) {
            let tmpData = lookUpData[i].theData[i2];
            //debug
            //console.log(tmpData);
            //console.log(theValue);
            //console.log(theData.name);
            if (tmpData.id == theValue) selected = "selected";
            else selected = "";
            theOptions =
              theOptions +
              `<option value="${tmpData.id}" ${selected}>${tmpData.name}</option>`;
          }
        }
      }
    }
  }
  //check for local lookups
  if (theOptions == "")
    theOptions = processlocalDropDown(
      theData,
      theSettings.localDropDown,
      theValue
    );

  if (theOptions != "") {
    renderInp = 2;
  }

  switch (renderInp) {
    case 1:
      inpHtml = `<div class="form-group ${visible}">
                        <label>${theTitle}</label>
                        <input type="${theType}" class="form-control form-control-user" name="inp-${theData.name}" id="inp-${theData.name}" aria-describedby="${theData.name}" placeholder="Enter ${theTitle}" value="${theValue}" ${disabled}>
                        <span class="text-danger d-none" id="error-${theData.name}"></span>  
                    </div>`;
      break;
    case 2:
      inpHtml = `<div class="form-group">
                        <label>${theTitle}</label>
                        <select class="form-control form-control-user" id="inp-${theData.name}">
                            <option value="">Please select</option>
                            ${theOptions}
                        </select>
                        <span class="text-danger d-none" id="error-${theData.name}"></span>  
                    </div>`;
      break;
  }

  //return it
  return inpHtml;
};

let getFormData = (smartValidate = 0) => {
  //clear the errors
  let theErrors = document.getElementsByClassName("text-danger");
  for (var i = 0; i < theErrors.length; ++i) {
    theErrors[i].classList.add("d-none");
  }
  //build the json
  let theJson = "{";
  //get the form elements (this is built by the checkElement function )
  let theElements = document.getElementsByClassName("form-control-user");
  //loop through the elements
  let valid = 1;
  for (var i = 0; i < theElements.length; ++i) {
    //get the element name
    let elementName = theElements[i].id;
    //get the name.
    let fieldName = elementName.replace("inp-", "");
    //check if its blank
    if (theElements[i].value == "") {
      //set the error id
      let errorId = elementName.replace("inp", "error");
      //change the message
      document.getElementById(
        errorId
      ).innerHTML = `${fieldName} cannot be blank`;
      //remove the error
      document.getElementById(errorId).classList.remove("d-none");
      //set valid to false
      valid = 0;
    }
    //check if we want to smart validation
    if (smartValidate == 1) {
      //chekc if the field type is an email
      if (elementName == "inp-email") {
        if (validateEmail(theElements[i].value) == false) {
          //set the error id
          let errorId = elementName.replace("inp", "error");
          //change the message
          document.getElementById(
            errorId
          ).innerHTML = `${fieldName} has to be an email`;
          //remove the error
          document.getElementById(errorId).classList.remove("d-none");
          //set valid to false
          valid = 0;
        }
      }
      //check if its an integer field

      //check if its a password field
    }
    //build the json
    if (theJson == "{")
      theJson = theJson + `"${fieldName}":"${theElements[i].value}"`;
    else theJson = theJson + `,"${fieldName}":"${theElements[i].value}"`;
  }

  let theTable = document.getElementById("formTableName").value;
  //check is isAdmin and the it is one of the tables we want to add attach to the admin
  if (user.isAdmin == 1 && theTable == "user") {
    theJson = theJson + `,"table":"${theTable}"`;
    //note we should check there is an admin Id.
    theJson = theJson + `,"adminId":"${user.id}" }`;
  } else {
    theJson = theJson + `,"table":"${theTable}" }`;
  }

  if (valid == 1) return JSON.parse(theJson);
  else return false;
};

let formatNumber = (code) => {
  let theNumber = code.toLocaleString();
  return theNumber;
};

let formatCurencyBaht = (code, digits = 2) => {
  const formatter = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: digits,
  });
  let currency = formatter.format(code);
  return currency;
};

let formatCurencyUSD = (code, digits = 2) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
  });
  let currency = formatter.format(code);
  return currency;
};

/*
This function handles the input of a create form
*/
if (checkElement("btn-create") == true) {
  document.getElementById("btn-create").addEventListener("click", function () {
    //process the API call
    let xhrDone = (res) => {
      //parse the response
      res = JSON.parse(res);
      //show the message

      showAlert(res.message, 1, 0, 1);
      //clear the header
      document.getElementById("data-header").innerHTML = "";
      //clear the elements
      clearFormData();
    };
    //get the form data
    let theJson = getFormData(1);
    if (theJson != false) {
      let bodyObj = {
        table: document.getElementById("formTableName").value,
        tableData: theJson,
      };
      let bodyObjectJson = JSON.stringify(bodyObj);
      xhrcall(
        0,
        apiUrl + `database/table/`,
        bodyObjectJson,
        "json",
        "",
        xhrDone,
        token
      );
    }
  });
}

/*
This function calls the table update
*/
if (checkElement("btn-update") == true) {
  document.getElementById("btn-update").addEventListener("click", function () {
    //process the API call
    let xhrDone = (res) => {
      //parse the response
      res = JSON.parse(res);
      //show the message
      showAlert(res.message, 1, 0, 1);
      //clear the header
      document.getElementById("data-header").innerHTML = "";
    };
    //get the form data
    let theJson = getFormData(1);
    if (theJson != false) {
      let bodyObj = {
        table: document.getElementById("formTableName").value,
        tableData: theJson,
      };
      //console.log(bodyObj)
      let bodyObjectJson = JSON.stringify(bodyObj);
      //check we have valid data to submit
      //post the record
      xhrcall(
        4,
        apiUrl + `database/table/`,
        bodyObjectJson,
        "json",
        "",
        xhrDone,
        token
      );
    }
  });
}

/*
END OF TABLE PROCESSING FUNCTIONS
*/

/*
START OF LOCAL CACHE FUNCTIONS
*/

let clearCache = (clearUser = 0) => {
  if (clearUser == 1) {
    window.localStorage.token = "";
    window.localStorage.user = "";
    window.localStorage.settings = "";
  }
};

let storeSettings = (theData, debug = 0) => {
  //show debug info
  if (debug == 1) {
    console.log(theData);
  }
  window.localStorage.settings = theData;
};

let getSettings = (debug = 0) => {
  //show debug info
  if (debug == 1) {
    console.log(theData);
  }
  return window.localStorage.settings;
};

let getUser = (parseIt = 0, debug = 0) => {
  //show debug info
  if (debug == 1) {
    console.log(theData);
  }
  let tmp = window.localStorage.user;
  if (parseIt == 1) tmp = JSON.parse(tmp);
  return tmp;
};

/*
END OF LOCAL CACHE FUNCTIONS
*/

/*
START OF TABLE FUNCTIONS
*/

let deleteId = 0;
let tableRowId = 0;
let deleteMethod = "";
let tableName = "";
let deleteTableName = "";

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

//checkElement = document.getElementById("confirmation-modal-delete-button");
if (checkElement("confirmation-modal-delete-button") == true) {
  //if (typeof(checkElement) != 'undefined' && checkElement != null) {
  document
    .getElementById("confirmation-modal-delete-button")
    .addEventListener("click", function () {
      $("#confirmation-modal").modal("toggle");
      let xhrDone = (res) => {
        res = JSON.parse(res);
        showAlert(res.message, 1);
        table
          .row("#" + tableRowId)
          .remove()
          .draw();
        //show the create new button
        if ((allowOnlyOne = 1) && table.rows().count() == 0)
          document.getElementById("btn-create-cy").classList.remove("d-none");
      };

      let bodyObj = {
        id: deleteId,
        tableName: deleteTableName,
      };
      var bodyObjectJson = JSON.stringify(bodyObj);
      //call the delete table record endpoint
      xhrcall(3, `${deleteMethod}`, bodyObjectJson, "json", "", xhrDone, token);
    });
}

let deleteTableItem = (dId, method, tTableName) => {
  deleteId = dId;
  tableRowId = dId;
  deleteMethod = method;
  deleteTableName = tTableName;
  $("#confirmation-modal").modal("toggle");
  let tmpTable = $("#dataTable").DataTable();
  //console.log(tmpTable.data().count())
};

//todo : make this work with multipile fields and values.
let switchTableItem = (
  dId,
  method,
  tTableName,
  tSchema = {},
  toggleBtns = 0
) => {
  tSchema.id = dId;
  let bodyobj = {
    table: tTableName,
    tableData: tSchema,
  };
  //debug
  //console.log(tSchema[0])
  //console.log(tSchema[Object.keys(tSchema)[0]]);

  var bodyobjectjson = JSON.stringify(bodyobj);
  let xhrDone = (res) => {
    //console.log(bodyobjectjson)

    //check if the element is there before we try an update
    if (checkElement(`off-${tTableName}-${dId}`) == true) {
      //this is redundant now so we may remove it
      if (toggleBtns == 1) {
        //check the value
        if (tSchema[Object.keys(tSchema)[0]] == 0) {
          //show the on state
          document
            .getElementById(`off-${tTableName}-${dId}`)
            .classList.add("d-none");
          document
            .getElementById(`on-${tTableName}-${dId}`)
            .classList.remove("d-none");
          document.getElementById(`text-${tTableName}-${dId}`).innerHTML = "No";
        } else {
          //show the off state
          document
            .getElementById(`off-${tTableName}-${dId}`)
            .classList.remove("d-none");
          document
            .getElementById(`on-${tTableName}-${dId}`)
            .classList.add("d-none");
          document.getElementById(`text-${tTableName}-${dId}`).innerHTML =
            "Yes";
        }
      }
    }
  };
  //call a put to update the fields
  xhrcall(4, `${method}`, bodyobjectjson, "json", "", xhrDone, token);
};

/*
END OF TABLE FUNCTIONS
*/

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

let logout = () => {
  alert("to do logout");
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
        document.getElementById("navadmin").classList.remove("d-none");
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
//let init = async () => { }

let xhrcall = async (
  type = 1,
  method,
  bodyObj = "",
  setHeader = "",
  redirectUrl = "",
  callback = "",
  auth = ""
) => {
  //debug
  //console.log(apiUrl)
  //console.log(bodyObj)
  //console.log(method)
  //console.log(callback)

  /*
      Note if we are not using strai and have a custom URL we can change it here like wise if we want to use 2 we can check the method to select the correct base url
    */

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
    if (xhr.status == 405) {
      errorMessage = res;
    }

    if (xhr.status == 205) {
      errorMessage = res;
    }

    if (errorMessage != "") {
      showAlert(errorMessage, 2);
    }

    //check if it was ok.
    if (xhr.status == 200) {
      //check if a redirecr url as passed.
      if (redirectUrl != "") {
        window.location = redirectUrl;
      } else {
        //console.log(res)
        //res = JSON.parse(res)
        //console.log(res)
        eval(callback(res));
      }
    }
  };
};

checkLogin();
