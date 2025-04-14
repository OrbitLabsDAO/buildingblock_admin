require("dotenv").config();

let todaysDate = new Date();
let _YEAR = todaysDate.getFullYear();

module.exports = {
  YEAR: _YEAR,
  TITLE: "Admin Jamstack",
  APIURL: process.env.APIURL,
  ADMINURL: process.env.ADMINURL,
  COPYRIGHT: "CRYPTOSKILLZ " + _YEAR,
  ENVIRONMENT: process.env.ELEVENTY_ENV,
  SECRET: process.env.SECRET,
  CANCREATEACCOUNT: process.env.CANCREATEACCOUNT,
  COMPLEXPASSWORD: process.env.COMPLEXPASSWORD,
  RESETPASSWORD: process.env.RESETPASSWORD,
  EXCLUDEDFIELDS: [
    "password",
    "resetPassword",
    "isDeleted",
    "createdAt",
    "updatedAt",
    "publishedAt",
    "deletedAt",
    "cfId",
    "cfImageUrl",
    "isCfImageDraft", //should chnage this to is draft
  ], //these are the fields that will be removed from any rendering
  EXCLUDETABLES: ["userAccess"],
  RESERVEDTABLES: ["_user"], //these are the tables used internally that will be removed from any rendering
};
