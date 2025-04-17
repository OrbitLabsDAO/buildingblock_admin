const fs = require("fs");
const path = require("path");
const sqliteParser = require("sqlite-parser");
const nunjucks = require("nunjucks");
const matter = require("gray-matter");
const { count } = require("console");

// === ENVIRONMENT SETUP ===
const args = process.argv.slice(2);
const environment = args.includes("prod") ? "production" : "local";

nunjucks.configure(["_custom", "_corenjks"], {
  autoescape: true,
  noCache: true,
});

// === ENV CONFIG LOADING ===
let env = {};
try {
  if (fs.existsSync("./_data/env.js")) {
    env = require("./_data/env.js");
    console.log("✅ env.js file loaded");
  }
} catch (err) {
  console.error("❌ Error loading env.js:", err);
}

// === READ SQL SCHEMA ===
const sqlFilePath = "sql/schema.sql";
if (!fs.existsSync(sqlFilePath)) {
  console.error("❌ Invalid path. Please specify a valid SQL file.");
  process.exit(1);
}
const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");
const parsedSchema = sqliteParser(sqlContent);

// === PATHS ===
const siteDir = path.join(__dirname, "_site");
const assetsFolder = path.join("_source", "assets");
const functionsFolder = path.join("_source", "functions");
const coreFolder = path.join(__dirname, "_corenjks");
const customFolder = path.join(__dirname, "_custom");

// === UTILITIES ===
/**
 * Copy a directory from the source path to the destination path.
 * @param {string} src - The source path.
 * @param {string} dest - The destination path.
 * @description
 * This function recursively copies all files and directories from the source path
 * to the destination path.
 */
const copyDirectory = (src, dest) => {
  if (!fs.existsSync(dest)) {
    // Create the destination directory if it doesn't exist
    fs.mkdirSync(dest, { recursive: true });
  }

  // Iterate over the files in the source directory
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    // If the item is a directory, recursively copy it
    if (fs.lstatSync(srcPath).isDirectory()) {
      // Recursively call copyDirectory
      copyDirectory(srcPath, destPath);
    } else {
      // Otherwise, copy the file
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

/**
 * Process a single file and return the layout, permalink, and content.
 * @param {string} templateName - The name of the file to process.
 * @param {string} folder - The folder to look for the file in.
 * @returns {Object|null} - An object with the layout, permalink, and content if the file exists, null otherwise.
 */
const processFile = (templateName, folder) => {
  const filePath = path.join(folder, templateName);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, "utf-8"));
  return {
    layout: data.layout || "",
    permalink: data.permalink || "",
    content,
  };
};

/**
 * Renders a template with a given layout.
 * @param {string} layoutName - The name of the layout template.
 * @param {Object} context - The context object to pass to the template.
 * @returns {string} - The rendered template with the layout.
 * @throws {Error} - If the layout template is not found.
 */
const renderTemplateWithLayout = (layoutName, context) => {
  // Iterate over the directories where layouts could be stored
  for (const dir of ["_custom", "_corenjks"]) {
    const layoutPath = path.join(dir, layoutName);
    if (fs.existsSync(layoutPath)) {
      // Read the layout template
      const template = fs.readFileSync(layoutPath, "utf-8");
      // Render the template with the context
      return nunjucks.renderString(template, context);
    }
  }
  throw new Error(`Layout template '${layoutName}' not found`);
};

// === GENERATORS ===
/**
 * Generates API functions for all tables.
 * @param {string[]} tableNames - The names of the tables to generate API functions for.
 */
const generateApiFunctions = (tableNames) => {
  console.log("✅ Processing API files!");

  const apiFolder = path.join(siteDir, "../functions/api/tables");
  if (fs.existsSync(apiFolder))
    fs.rmSync(apiFolder, { recursive: true, force: true });
  fs.mkdirSync(apiFolder, { recursive: true });

  const templatePath = path.join("_corenjks", "apiGenerator.njk");
  if (!fs.existsSync(templatePath))
    return console.error("❌ apiGenerator.njk not found");

  const apiContent = fs.readFileSync(templatePath, "utf-8");
  const allTables = [...tableNames, "_user"];

  // Loop through all tables
  allTables.forEach((tableName) => {
    try {
      // Render the API template with the table name and environment
      const rendered = nunjucks.renderString(apiContent, { tableName, env });
      // Write the rendered API function to disk
      fs.writeFileSync(path.join(apiFolder, `${tableName}.js`), rendered);
      console.log(`✅ Created API endpoint for ${tableName}`);
    } catch (err) {
      // Log any errors
      console.error(`❌ Error rendering API for ${tableName}:`, err);
    }
  });
  console.log("✅ API files Processed!");
};

/**
 * Generates the table pages for a given table.
 * @param {string} tableName - The name of the table to generate pages for.
 * @param {object[]} fields - The list of fields in the table.
 * @param {object[]} fieldsIndex - The list of fields in the table's index.
 * @param {string[]} tableNames - The list of all table names.
 * @param {object} sharedOptions - An object containing shared select options.
 * @param {object} fieldOptionMapping - An object containing table-specific select overrides.
 */
const generateTablePages = (
  tableName,
  fields,
  fieldsIndex,
  tableNames,
  sharedOptions,
  fieldOptionMapping
) => {
  const pageDir = path.join(siteDir, `tables/${tableName}`);
  fs.mkdirSync(pageDir, { recursive: true });

  //validate fields function to render selects
  const validateFields = (fieldList, tableName) =>
    fieldList.map((field) => {
      const isRequired =
        field.definition &&
        field.definition.some(
          (def) => def.type === "constraint" && def.variant === "not null"
        );
      const checkConstraint = field.definition?.find(
        (def) => def.type === "constraint" && def.variant === "check"
      );

      let selectOptions = null;

      // 1. Use override from env.FIELDOPTIONMAPPING
      console.log(env.SHAREDOPTIONS.countryList);
      const overrideKey = fieldOptionMapping?.[tableName]?.[field.name];
      if (overrideKey) {
        const overrideOptions = Array.isArray(overrideKey)
          ? overrideKey
          : sharedOptions?.[overrideKey];

        if (overrideOptions) {
          selectOptions = overrideOptions;
        }
      }

      // 2. Check constraints (e.g., status IN (1, 2, 3))
      if (
        !selectOptions &&
        checkConstraint?.expression?.variant === "operation" &&
        checkConstraint.expression.operation === "in"
      ) {
        const expr = checkConstraint.expression;
        if (
          expr.right?.variant === "list" &&
          Array.isArray(expr.right.expression)
        ) {
          selectOptions = expr.right.expression.map((item) => ({
            value: item.value,
            label: item.value,
          }));
        }
      }

      // 3. Boolean fallback
      if (
        !selectOptions &&
        field.datatype?.variant?.toLowerCase() === "boolean"
      ) {
        selectOptions = sharedOptions?.yesNo || [
          { value: "1", label: "Yes" },
          { value: "0", label: "No" },
        ];
      }

      return {
        ...field,
        isRequired,
        selectOptions,
      };
    });

  // Generate the table pages
  ["Index", "View", "Add", "Edit"].forEach((type) => {
    const isIndexPage = type === "Index";
    const relevantFields = validateFields(
      isIndexPage ? fieldsIndex : fields,
      tableName
    );
    //console.log(relevantFields);
    const data = processFile(`table${type}.njk`, "_corenjks") || {};
    const filePath = path.join(pageDir, `${type.toLowerCase()}.html`);
    const inner = nunjucks.renderString(data.content, {
      tableName,
      fields: relevantFields,
      tableNames,
      env,
    });

    const content = data.layout
      ? renderTemplateWithLayout(data.layout, {
          tableName,
          fields: relevantFields,
          content: inner,
          tableNames,
          env,
        })
      : inner;

    fs.writeFileSync(filePath, content);
    console.log(`✅ Created page ${tableName}/${type}.html`);
  });
};

/**
 * Process the custom account files.
 * @param {string[]} tableNames - The names of all tables.
 */
const processAccountFiles = (tableNames) => {
  console.log("✅ Processing Account files!");

  const files = fs
    .readdirSync(coreFolder)
    .filter((f) => f.startsWith("account-") && f.endsWith(".njk"));

  files.forEach((file) => {
    const skipCreate =
      file === "account-create.njk" && env.CANCREATEACCOUNT === "0";
    const skipReset =
      file === "account-resetpassword.njk" && env.RESETPASSWORD === "0";
    if (skipCreate || skipReset) {
      console.log(`✅ Skipping ${file} based on environment`);
      return;
    }

    const { layout, permalink, content } = processFile(file, coreFolder) || {};
    const filename = permalink || file.replace(".njk", "");
    const outputDir = path.join(siteDir, filename);
    const outputFile = path.join(outputDir, "index.html");

    fs.mkdirSync(outputDir, { recursive: true });

    const inner = nunjucks.renderString(content, { env, tableNames });
    const final = layout
      ? renderTemplateWithLayout(layout, {
          content: inner,
          env,
          tableNames,
        })
      : inner;

    fs.writeFileSync(outputFile, final);
    console.log(`✅ Created account page: ${filename}.html`);
  });
  console.log("✅ Account files Processed!");
};
const pathExists = (p) => fs.existsSync(p);
const isTemplateFile = (file) => file.endsWith(".njk");
const isJsFile = (file) => file.endsWith(".js");

/**
 * Copies all .njk layouts from custom/layouts into the core folder.
 */
const processCustomLayouts = () => {
  console.log("✅ Processing custom layouts!");
  const layoutPath = path.join(customFolder, "layouts");

  // Check if the directory exists before proceeding
  if (fs.existsSync(layoutPath)) {
    fs.readdirSync(layoutPath)
      .filter(isTemplateFile)
      .forEach((file) => {
        const src = path.join(layoutPath, file);
        const dest = path.join(coreFolder, file);
        fs.copyFileSync(src, dest);
        console.log(`✅ Created custom layout: ${file}`);
      });
    console.log("✅ Custom layouts processed!");
  } else {
    console.error(`❌ Layouts folder does not exist: ${layoutPath}`);
  }
};

/**
 * Copies all .js functions from _custom/functions to functions/api.
 * This allows developers to easily create new API endpoints.
 */
const processCustomFunctions = () => {
  console.log("✅ Processing custom functions!");
  const functionPath = path.join(customFolder, "functions");
  if (fs.existsSync(functionPath)) {
    fs.readdirSync(functionPath)
      .filter(isJsFile)
      .forEach((file) => {
        const src = path.join(functionPath, file);
        const dest = path.join("functions/api", file);
        fs.copyFileSync(src, dest);
        console.log(`✅ Created custom function: ${file}`);
      });
  }
  console.log("✅ Custom functions processed!");
};

/**
 * Process custom folders for table- or new- prefixed overrides.
 * @param {string} [prefix=""] - The prefix to filter custom folders by.
 * @param {string} [outputSubfolder=""] - The subfolder to create in the output folder.
 * @param {string} [jsDest="functions/api/"] - The destination folder for JavaScript files.
 */
const processCustomFolders = (
  prefix = "",
  outputSubfolder = "",
  jsDest = "functions/api/"
) => {
  console.log(`✅ Processing custom ${prefix}!`);

  // Create the custom folder if it doesn't exist
  fs.mkdirSync(customFolder, { recursive: true });

  // Iterate over the custom folder and find all folders that start with the prefix
  fs.readdirSync(customFolder)
    .filter((f) => f.startsWith(prefix))
    .forEach((folder) => {
      console.log(`✅ Processing custom folder: ${folder}`);

      // Get the base name of the folder (without the prefix)
      const baseName = folder.replace(prefix, "");

      // Create the output folder for this custom folder
      const outputPath = path.join(siteDir, outputSubfolder, baseName);
      fs.mkdirSync(outputPath, { recursive: true });

      // Iterate over the files in the custom folder
      fs.readdirSync(folder).forEach((file) => {
        const fullPath = path.join(folder, file);

        // If the file is a JavaScript file, copy it to the output folder
        if (isJsFile(file)) {
          const destJsPath = path.join(
            jsDest,
            `${outputSubfolder}${baseName}.js`
          );
          fs.mkdirSync(path.dirname(destJsPath), { recursive: true });
          fs.copyFileSync(fullPath, destJsPath);
          console.log(`✅ Copied JS: ${file} to ${destJsPath}`);
        } else if (isTemplateFile(file)) {
          // If the file is a template file, render it with the context
          const { layout, content } = processFile(file, folder) || {};
          const viewType = file
            .replace("table", "")
            .replace(".njk", "")
            .toLowerCase();
          const outputFile = path.join(outputPath, `${viewType}.html`);

          const renderedInner = nunjucks.renderString(content, {
            env,
            tableNames,
          });
          console.log(tableName);
          const final = layout
            ? renderTemplateWithLayout(layout, {
                content: renderedInner,
                env,
                tableNames,
              })
            : renderedInner;

          // Write the rendered template to the output folder
          fs.writeFileSync(outputFile, final);
          console.log(`✅ Created custom page: ${outputFile}`);
        }
      });
    });

  console.log(`✅ Custom ${prefix} processed!`);
};

/**
 * Fetches a list of countries from a public API and updates the shared options with country data.
 * Each country is represented as an object containing a country code and its common name.
 * The list is sorted alphabetically by country name and stored in `env.SHAREDOPTIONS.countryList`.
 */

async function updateSharedCountryList() {
  const urlEntry = env.DATALISTS.find(
    (item) => item.value === "updateSharedCountryList"
  );
  if (!urlEntry) {
    console.error("❌ URL for updateSharedCountryList not found in DATALISTS");
    return;
  }

  const res = await fetch(urlEntry.URL);
  const countries = await res.json();

  const prioritise = urlEntry.prioritise || [];
  const exclude = urlEntry.exclude || [];

  // Build and filter list
  const allOptions = countries
    .map((c) => ({
      value: c.cca2,
      label: c.name.common,
    }))
    .filter((c) => c.value && c.label && !exclude.includes(c.value));

  const topCountries = [];
  const remainingCountries = [];

  for (const country of allOptions) {
    if (prioritise.includes(country.value)) {
      topCountries.push(country);
    } else {
      remainingCountries.push(country);
    }
  }

  topCountries.sort((a, b) => a.label.localeCompare(b.label));
  remainingCountries.sort((a, b) => a.label.localeCompare(b.label));

  const countryOptions = [...topCountries, ...remainingCountries];

  env.SHAREDOPTIONS.countryList = countryOptions;

  console.log(
    `✅ Updated SHAREDOPTIONS.countryList with ${countryOptions.length} countries (Top: ${topCountries.length}, Excluded: ${exclude.length})`
  );
}

// === BUILD START ===
/**
 * Main entry point for the build script.
 * @returns {Promise<void>} Resolves when the build is complete.
 */
(async () => {
  try {
    // === UPDATE SHARED COUNTRY LIST ===
    // Update the SHAREDOPTIONS.countryList with the latest country list
    await updateSharedCountryList();

    // === CLEAN SITE FOLDER ===
    if (fs.existsSync(siteDir))
      fs.rmSync(siteDir, { recursive: true, force: true });
    fs.mkdirSync(siteDir, { recursive: true });

    // === COPY ASSETS AND FUNCTIONS ===
    if (fs.existsSync(assetsFolder))
      copyDirectory(assetsFolder, path.join(siteDir, "assets"));
    if (fs.existsSync(functionsFolder))
      copyDirectory(functionsFolder, path.join(siteDir, "functions"));

    // === PARSE TABLES FROM SCHEMA ===
    // === Collect all valid table names (after exclusions) ===
    const tableNames = parsedSchema.statement
      .filter(
        (stmt) =>
          stmt.variant === "create" &&
          stmt.format === "table" &&
          !env.EXCLUDETABLES.includes(stmt.name.name)
      )
      .map((stmt) => stmt.name.name)
      .filter((name) => !env.RESERVEDTABLES.includes(name));

    // === GENERATE TABLE PAGES ===
    console.log("✅ Processing Table files!");

    // Process each statement in the parsed schema
    parsedSchema.statement.forEach((stmt) => {
      // Check if the statement is a CREATE TABLE statement
      if (
        stmt.variant === "create" &&
        stmt.format === "table" &&
        !env.EXCLUDETABLES.includes(stmt.name.name)
      ) {
        const tableName = stmt.name.name;
        const fields = stmt.definition;
        // Generate human-readable field labels
        // Loop through each field
        fields.forEach((field) => {
          // Check if the field has a name and generate a human-readable label
          if (field.name) {
            field.label = field.name
              .replace(/_/g, " ")
              .replace(/([a-z])([A-Z])/g, "$1 $2")
              .replace(/\b\w/g, (c) => c.toUpperCase());
          }

          // Check if this field has a foreign key constraint
          if (
            field.definition &&
            field.definition[0] &&
            field.definition[0].variant === "foreign key"
          ) {
            const foreignTable = field.definition[0].references.name; // The table this field references
            const foreignId = field.definition[0].references.columns[0].name; // The field it references
            const primaryId = field.columns[0].name; // The primary key field name (the current field)
            // Now loop through fields again to add foreign table and foreign id to the field that matches the primary field
            fields.forEach((compareField) => {
              if (compareField.name === primaryId) {
                compareField.foreignTable = foreignTable;
                compareField.foreignId = foreignId;
              }
            });
          }
        });

        // Filter out fields that should be excluded
        const sanitizedFields = fields.filter(
          (f) => !env.EXCLUDEDFIELDS.includes(f.name)
        );

        const sanitizedFieldsIndex = fields.filter(
          (f) => !env.EXCLUDEDFIELDSINDEX.includes(f.name)
        );
        //set the shared optons and field options for the select
        const sharedOptions = env.SHAREDOPTIONS;
        const fieldOptionMapping = env.FIELDOPTIONMAPPING;
        // Generate table pages
        if (!env.EXCLUDETABLES.includes(tableName)) {
          generateTablePages(
            tableName,
            sanitizedFields,
            sanitizedFieldsIndex,
            tableNames,
            sharedOptions,
            fieldOptionMapping
          );
        }
      }
    });
    console.log("✅ Table files Processed!");
    // Process custom layouts in the _custom/layouts folder
    processCustomLayouts();
    // Generate account pages in the _site/account folder
    processAccountFiles(tableNames);
    // Generate API endpoints in the functions/api/tables folder
    generateApiFunctions(tableNames);
    // Process custom table folders in the _custom/tables folder and output in the _site/tables folder
    processCustomFolders("table_", "tables/", "functions/api/");
    // Process custom new folders in the _custom/new folder and output in the _site folder
    processCustomFolders("new_", "", "functions/api/");
    // Copy all .js functions from _custom/functions to functions/api
    processCustomFunctions();

    /**
     * Generate the main index page.
     * This writes the rendered output of 'indexMain.njk' to 'index.html'.
     */
    fs.writeFileSync(
      path.join(siteDir, "index.html"), // Define the output path for the index file
      nunjucks.render("indexMain.njk", { tableNames }) // Render the template with table names
    );
    console.log("✅ Main index page generated!");
  } catch (err) {
    console.error("❌ Failed to update country list:", err);
  }
})();
