const fs = require("fs");
const path = require("path");
const sqliteParser = require("sqlite-parser");
const nunjucks = require("nunjucks");
const matter = require("gray-matter");

// ✅ Set up Nunjucks environment with multiple loaders
nunjucks.configure(["_custom", "_corenjks"], {
  autoescape: true,
  noCache: true,
});

const args = process.argv.slice(2);
const environment = args.includes("prod") ? "production" : "local";

// Load environment config
let env = {};
try {
  if (fs.existsSync("./_data/env.js")) {
    env = require("./_data/env.js");
    console.log("✅ env.js file loaded");
  }
} catch (err) {
  console.error("❌ Error loading env.js:", err);
}

// Check SQL file
let sqlFilePath = "sql/schema.sql";
if (!fs.existsSync(sqlFilePath)) {
  console.error("❌ Invalid path. Please specify a valid SQL file.");
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");
const parsedSchema = sqliteParser(sqlContent);

// Define directories
const siteDir = path.join(__dirname, "_site");
const assetsFolder = path.join("./_source", "assets");
const functionsFolder = path.join("./_source", "functions");
const coreFolder = path.join(__dirname, "_corenjks");

// Utility: Copy Directory
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach((item) => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Utility: Process File
function processFile(templateName, folder) {
  const filePath = path.join(folder, templateName);
  if (!fs.existsSync(filePath)) return null;
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data: frontMatter, content } = matter(fileContent);
  return {
    layout: frontMatter.layout || "",
    permalink: frontMatter.permalink || "",
    content,
  };
}

// ✅ FIX 2: Dynamic Template Loading
function renderTemplateWithLayout(layoutName, context) {
  // Check search paths for the template
  const searchPaths = ["_custom", "_corenjks"];
  let layoutPath = null;

  for (const dir of searchPaths) {
    const possiblePath = path.join(dir, layoutName);
    //debug
    //console.log(possiblePath);
    if (fs.existsSync(possiblePath)) {
      layoutPath = possiblePath;
      break;
    }
  }

  if (!layoutPath) {
    throw new Error(
      `Layout template '${layoutName}' not found in search paths.`
    );
  }

  // Read template content manually
  const templateContent = fs.readFileSync(layoutPath, "utf-8");
  return nunjucks.renderString(templateContent, context);
}

// Utility: Generate API Endpoints for Each Table
function generateApiFunctions(tableNames) {
  const apiFolder = path.join(siteDir, "../functions/api/tables");

  // Clear existing API folder
  if (fs.existsSync(apiFolder)) {
    fs.rmSync(apiFolder, { recursive: true, force: true });
  }

  if (!fs.existsSync(apiFolder)) {
    fs.mkdirSync(apiFolder, { recursive: true });
  }

  tableNames.forEach((tableName) => {
    const templatePath = path.join("_corenjks", "apiGenerator.njk");

    if (!fs.existsSync(templatePath)) {
      console.error("❌ apiGenerator.njk template not found");
      return;
    }

    const apiContent = fs.readFileSync(templatePath, "utf-8");

    try {
      const renderedApi = nunjucks.renderString(apiContent, {
        tableName,
        env,
      });

      const outputPath = path.join(apiFolder, `${tableName}.js`);
      fs.writeFileSync(outputPath, renderedApi);
      console.log(`✅ Created API endpoint for ${tableName}`);
    } catch (error) {
      console.error(`❌ Error rendering API for ${tableName}:`, error);
    }
  });
}

// Utility: Generate Pages
function generateTablePages(tableName, fields, tableNames) {
  const tableDir = path.join(siteDir, `/tables/${tableName}`);
  if (!fs.existsSync(tableDir)) {
    fs.mkdirSync(tableDir, { recursive: true });
  }

  const pageTypes = ["Index", "View", "Add", "Edit"];
  pageTypes.forEach((pageType) => {
    console.log(`table${pageType}.njk`);
    const pageData = processFile(`table${pageType}.njk`, "_corenjks") || {};
    const outputFile = path.join(tableDir, `${pageType}.html`);

    let renderedContent;

    if (pageData.layout) {
      try {
        renderedContent = renderTemplateWithLayout(pageData.layout, {
          tableName,
          fields,
          content: nunjucks.renderString(pageData.content, {
            tableName,
            fields,
            tableNames, // Pass tableNames to the context
          }),
          env,
          tableNames, // Pass tableNames here as well
        });
      } catch (err) {
        console.error(`❌ Error rendering layout ${pageData.layout}:`, err);
      }
    } else {
      renderedContent = nunjucks.renderString(pageData.content, {
        tableName,
        fields,
        env,
        tableNames, // Pass tableNames here as well
      });
    }

    fs.writeFileSync(outputFile, renderedContent);
    console.log(`✅ Created page ${tableName}/${pageType}.html`);
  });
}

// Utility: Process Account Files
function processAccountFiles(tableNames) {
  const accountFiles = fs
    .readdirSync(coreFolder)
    .filter((file) => file.endsWith(".njk"));

  accountFiles.forEach((file) => {
    const pageData = processFile(file, coreFolder) || {};

    // Check if CANCREATEACCOUNT is set to 0, and skip 'account-create.njk' if so
    if (file === "account-create.njk" && env.CANCREATEACCOUNT === "0") {
      console.log(
        "✅ Skipping account-create.njk due to CANCREATEACCOUNT being set to 0."
      );
      return; // Exit early to prevent processing
    }

    if (file === "account-resetpassword.njk" && env.RESETPASSWORD === "0") {
      console.log(
        "✅ Skipping forgot-password.njk due to FORGOTPASSWORD being set to 0."
      );
      return; // Exit early to prevent processing
    }

    if (pageData.content) {
      const tmpFile = file.replace(".njk", "");
      const outputDir = path.join(siteDir, tmpFile);
      const outputFile = path.join(outputDir, "index.html");

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      let renderedContent;

      if (pageData.layout) {
        try {
          renderedContent = renderTemplateWithLayout(pageData.layout, {
            content: nunjucks.renderString(pageData.content, {
              env,
              tableNames, // Ensure these are passed within the content rendering
            }),
            env,
            tableNames, // Pass tableNames here as well
          });
        } catch (err) {
          console.error(`❌ Error rendering layout ${pageData.layout}:`, err);
        }
      } else {
        renderedContent = nunjucks.renderString(pageData.content, {
          env,
          tableNames, // Ensure tableNames is passed here as well
        });
      }

      fs.writeFileSync(outputFile, renderedContent);
      console.log(`✅ Created account page: ${file}`);
    }
  });
}

// Delete _site folder
if (fs.existsSync(siteDir)) {
  fs.rmSync(siteDir, { recursive: true, force: true });
}
fs.mkdirSync(siteDir, { recursive: true });

// Copy assets and functions
if (fs.existsSync(assetsFolder)) {
  copyDirectory(assetsFolder, path.join(siteDir, "assets"));
}
if (fs.existsSync(functionsFolder)) {
  copyDirectory(functionsFolder, path.join(siteDir, "functions"));
}

//get all the table names so we can process the menu correctly
let tableNames = [];
if (Array.isArray(parsedSchema.statement)) {
  parsedSchema.statement.forEach((statement) => {
    if (statement.variant === "create" && statement.format === "table") {
      if (!env.EXCLUDETABLES.includes(statement.name.name)) {
        tableNames.push(statement.name.name);

        // Add a label for each field only if field.name is not empty or null
        statement.definition.forEach((field) => {
          if (field.name !== null && field.name !== undefined) {
            // Check if field.name is not null, undefined, or empty
            field.label = field.name
              // Replace underscores with spaces
              .replace(/_/g, " ")
              // Add spaces for camelCase (before each uppercase letter)
              .replace(/([a-z])([A-Z])/g, "$1 $2")
              // Capitalize the first letter of each word (optional)
              .replace(/\b\w/g, (char) => char.toUpperCase());
          } else {
            // Handle cases where field.name is undefined, null, or empty
            console.warn(`Skipping field with invalid name:`, field);
          }
        });
      }
    }
  });
}

if (Array.isArray(parsedSchema.statement)) {
  parsedSchema.statement.forEach((statement) => {
    if (statement.variant === "create" && statement.format === "table") {
      const tableName = statement.name.name;
      const fields = statement.definition;
      //santise the fields

      const sanitisedFields = fields.filter(
        (field) => !env.EXCLUDEDFIELDS.includes(field.name)
      );

      generateTablePages(tableName, sanitisedFields, tableNames);
    }
  });

  processAccountFiles(tableNames);

  // Generate individual API endpoints
  generateApiFunctions(tableNames);

  // Create main index
  fs.writeFileSync(
    path.join(siteDir, "index.html"),
    nunjucks.render("indexMain.njk", { tableNames })
  );
  console.log("✅ Main index page generated!");
} else {
  console.error("❌ Parsed schema is not in the expected format.");
}
