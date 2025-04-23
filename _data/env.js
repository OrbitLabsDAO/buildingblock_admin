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
  DATALISTS: [
    {
      value: "updateSharedCountryList",
      URL: "https://restcountries.com/v3.1/all",
      prioritise: ["US", "GB", "CA", "AU", "DE", "FR"], // ISO 3166-1 alpha-2 country codes
      exclude: ["AQ", "IR", "KP"], // Exclude Antarctica, Iran, North Korea (example)
    },
  ],
  EXCLUDEDFIELDS: [
    "resetPassword",
    "isDeleted",
    "createdAt",
    "updatedAt",
    "publishedAt",
    "deletedAt",
    "cfId",
    "isCfImageDraft",
  ], //these are the fields that will be removed from any rendering
  EXCLUDEDFIELDSINDEX: [
    "password",
    "resetPassword",
    "isDeleted",
    "createdAt",
    "updatedAt",
    "publishedAt",
    "deletedAt",
    "cfImageUrl",
    "address1",
    "address2",
    "address3",
    "address4",
    "address5",
    "address_5",
    "country",
    "propertyType",
    "currentlyRented",
    "adminId",
    "description",
    "admin",
    "paymentAddress",
    "telephone",
    "mobile",
    "priceUSD",
    "priceBTC",
    "exchangeRateToUSD",
    "exchangeRateToBTC",
    "currency",
    "datePurchased",
  ], //these are the fields that will be removed from any rendering
  EXCLUDETABLES: ["userAccess"],
  RESERVEDTABLES: ["_user"], //these are the tables used internally that will be removed from any rendering
  /**
   * A dictionary of shared options that can be used across multiple tables and fields
   * @typedef {Object} SharedOptions
   * @property {Object[]} yesNo - A list of yes/no options
   * @property {Object[]} userRoles - A list of user roles
   * @property {Object[]} countryList - A list of countries
   */
  SHAREDOPTIONS: {
    /**
     * A list of yes/no options
     * @type {Object[]}
     */
    yesNo: [
      { value: "0", label: "No" },
      { value: "1", label: "Yes" },
    ],
    /**
     * A list of user roles
     * @type {Object[]}
     */
    userRoles: [
      { value: "admin", label: "Administrator" },
      { value: "editor", label: "Editor" },
      { value: "viewer", label: "Viewer" },
    ],
    propertyTypes: [
      { value: "1", label: "Condo" },
      { value: "2", label: "House" },
    ],
    /**
     * A list of countries fetched from restcountries.com
     * @type {Object[]}
     */
    countryList: [],
  },

  /**
   * A dictionary of field option mappings that map a field to a shared option
   * @typedef {Object} FieldOptionMapping
   * @property {Object} property - Maps the "property" table to the shared options
   * @property {Object} users - Maps the "users" table to the shared options
   */
  FIELDOPTIONMAPPING: {
    property: {
      /**
       * Maps the "isActive" field to the yes/no shared options
       * @type {String}
       */
      isActive: "yesNo",
      /**
       * Maps the "isPublic" field to the yes/no shared options
       * @type {String}
       */
      isPublic: "yesNo",
      /**
       * Maps the "country" field to the countryList shared options
       * @type {String}
       */
      country: "countryList",
      propertyType: "propertyTypes",
    },
    users: {
      /**
       * Maps the "role" field to the userRoles shared options
       * @type {String}
       */
      role: "userRoles",
      /**
       * Maps the "isVerified" field to the yes/no shared options
       * @type {String}
       */
      isVerified: "yesNo",
    },
  },
};
