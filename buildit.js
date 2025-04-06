const fs = require("fs");
const path = require("path");
const sqliteParser = require("sqlite-parser");
const nunjucks = require("nunjucks");
const matter = require("gray-matter");

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
  const allTables = [...tableNames, "adminuser"];

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
 * Generates the table pages for the given table name and fields.
 * @param {string} tableName - The name of the table to generate pages for.
 * @param {Object[]} fields - The fields of the table to generate pages for.
 * @param {string[]} tableNames - The names of all tables.
 */
const generateTablePages = (tableName, fields, tableNames) => {
  const pageDir = path.join(siteDir, `tables/${tableName}`);
  fs.mkdirSync(pageDir, { recursive: true });

  // Generate the table pages
  ["Index", "View", "Add", "Edit"].forEach((type) => {
    const data = processFile(`table${type}.njk`, "_corenjks") || {};
    const filePath = path.join(pageDir, `${type.toLowerCase()}.html`);
    const inner = nunjucks.renderString(data.content, {
      tableName,
      fields,
      tableNames,
      env,
    });

    // Render the layout if it exists
    const content = data.layout
      ? renderTemplateWithLayout(data.layout, {
          tableName,
          fields,
          content: inner,
          tableNames,
          env,
        })
      : inner;

    // Write the rendered page to disk
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
      ? renderTemplateWithLayout(layout, { content: inner, env, tableNames })
      : inner;

    fs.writeFileSync(outputFile, final);
    console.log(`✅ Created account page: ${filename}.html`);
  });
  console.log("✅ Account files Processed!");
};

/**
 * Process the custom files in the _custom folder.
 *
 * This function will take all the folders in the _custom folder that start with
 * "table_" and treat them as custom pages for the corresponding table.
 */
const processCustomTables = () => {
  console.log("✅ Processing Custom tables!");
  const customFolders = fs
    .readdirSync(customFolder)
    .filter((f) => f.startsWith("table_"));
  customFolders.forEach((folder) => {
    const tableName = folder.replace("table_", "tables/");
    const files = fs.readdirSync(path.join(customFolder, folder));

    files.forEach((file) => {
      const fullPath = path.join(customFolder, folder, file);
      const outputPath = path.join(siteDir, tableName);
      fs.mkdirSync(outputPath, { recursive: true });

      // If the file is a .js file, copy it to the functions folder
      if (file.endsWith(".js")) {
        const dest = `functions/api/${tableName}.js`;
        fs.copyFileSync(fullPath, dest);
        console.log(`✅ Copied ${file} to ${dest}`);
        return;
      }

      // Process the file as a njk template
      const { layout, content } =
        processFile(file, path.join(customFolder, folder)) || {};
      const viewType = file
        .replace("table", "")
        .replace(".njk", "")
        .toLowerCase();
      const outputFile = path.join(outputPath, `${viewType}.html`);

      // Render the template with the layout if it exists
      const inner = nunjucks.renderString(content, { env, tableNames });
      const final = layout
        ? renderTemplateWithLayout(layout, { content: inner, env, tableNames })
        : inner;

      // Write the rendered template to the output file
      fs.writeFileSync(outputFile, final);
      console.log(`✅ Created custom page: ${file}`);
    });
  });
  console.log("✅ Custom tables processed!");
};

const processCustomFunctions = () => {
  console.log("✅ Processing Custom functions!");
  const files = fs.readdirSync(customFolder + "/functions");
  files.forEach((file) => {
    // If the file is a .js file, copy it to the functions folder
    const fullPath = path.join(customFolder, "functions", file);
    if (file.endsWith(".js")) {
      const dest = `functions/api/${file}`;
      fs.copyFileSync(fullPath, dest);
      console.log(`✅ Created custom function: ${file}`);
      return;
    }
  });
  console.log("✅ Custom functions processed!");
};

// === BUILD START ===
if (fs.existsSync(siteDir))
  fs.rmSync(siteDir, { recursive: true, force: true });
fs.mkdirSync(siteDir, { recursive: true });

if (fs.existsSync(assetsFolder))
  copyDirectory(assetsFolder, path.join(siteDir, "assets"));
if (fs.existsSync(functionsFolder))
  copyDirectory(functionsFolder, path.join(siteDir, "functions"));

// === PARSE TABLES FROM SCHEMA ===
let tableNames = [];

// === Collect all valid table names (after exclusions) ===
if (Array.isArray(parsedSchema.statement)) {
  tableNames = parsedSchema.statement
    .filter(
      (stmt) =>
        stmt.variant === "create" &&
        stmt.format === "table" &&
        !env.EXCLUDETABLES.includes(stmt.name.name)
    )
    .map((stmt) => stmt.name.name)
    .filter((name) => name !== "adminuser"); // explicitly remove adminuser;

  console.log(tableNames);
}

// === GENERATE TABLE PAGES ===
console.log("✅ Processing Table files!");

if (Array.isArray(parsedSchema.statement)) {
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
      fields.forEach((field) => {
        if (field.name) {
          field.label = field.name
            .replace(/_/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/\b\w/g, (c) => c.toUpperCase());
        }
      });

      // Filter out fields that should be excluded
      const sanitizedFields = fields.filter(
        (f) => !env.EXCLUDEDFIELDS.includes(f.name)
      );

      // Generate table pages
      if (!env.EXCLUDETABLES.includes(tableName)) {
        generateTablePages(tableName, sanitizedFields, tableNames);
      }
    }
  });
  console.log("✅ Table files Processed!");

  // === ADDITIONAL PAGES ===
  processAccountFiles(tableNames);
  generateApiFunctions(tableNames);
  processCustomTables();
  processCustomFunctions();

  // === MAIN INDEX PAGE ===
  fs.writeFileSync(
    path.join(siteDir, "index.html"),
    nunjucks.render("indexMain.njk", { tableNames })
  );
  console.log("✅ Main index page generated!");
} else {
  console.error("❌ Parsed schema is not in the expected format.");
}
