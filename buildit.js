const fs = require("fs");
const path = require("path");
const sqliteParser = require("sqlite-parser");
const nunjucks = require("nunjucks");

// Set up Nunjucks environment
nunjucks.configure("_includes", { autoescape: true });

// Get SQL file path from command-line arguments
let sqlFilePath = process.argv[2] || "sql/schema.sql"; // Use default if no argument is provided

// Check if the provided SQL file exists
if (!fs.existsSync(sqlFilePath)) {
  console.error("Invalid path. Please specify a valid SQL file.");
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");
const parsedSchema = sqliteParser(sqlContent);

// Define directories
const siteDir = path.join(__dirname, "_site");
const sourceFolder = "./_source";
const includesFolder = "./_includes";
const assetsFolder = path.join(sourceFolder, "assets");

/*
START OF UTILITY FUNCTIONS
*/

// Utility: Copy folder
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

// Utility: Generate API Functions
function generateApiFunctions(tableNames) {
  const functionsDir = path.join(siteDir, "functions");
  const customDir = path.join(__dirname, "_custom");

  if (!Array.isArray(tableNames)) {
    console.error("tableNames should be an array");
    return;
  }

  if (!fs.existsSync(functionsDir)) {
    fs.mkdirSync(functionsDir, { recursive: true });
  }

  tableNames.forEach((tableName) => {
    // Check for custom template
    const customTemplatePath = path.join(customDir, `${tableName}_api.njk`);
    let templateContent;

    if (fs.existsSync(customTemplatePath)) {
      console.log(`✅ Using custom template for ${tableName}`);

      // Create a temporary environment for custom templates
      const customEnv = new nunjucks.Environment(
        new nunjucks.FileSystemLoader("_custom"),
        { autoescape: true }
      );

      // Render using the temporary environment
      templateContent = customEnv.render(`${tableName}_api.njk`, { tableName });
    } else {
      console.log(`⚡ Using default template for ${tableName}`);
      templateContent = nunjucks.render("api.njk", { tableName });
    }

    fs.writeFileSync(
      path.join(functionsDir, `${tableName}.js`),
      templateContent
    );
  });

  console.log("✅ CRUD API functions generated in _site/functions!");
}

/*
END OF UTILITY FUNCTIONS
*/

// Delete the _site folder
if (!fs.existsSync(siteDir)) fs.mkdirSync(siteDir);
else {
  try {
    console.log("🗑 Deleting _site folder before build...");
    fs.rmSync(siteDir, { recursive: true, force: true });
    console.log("✅ _site folder deleted.");
  } catch (err) {
    console.error("❌ Failed to delete _site folder:", err);
  }
}

// Copy the assets from the _source folder
try {
  if (fs.existsSync(assetsFolder)) {
    const destAssetsFolder = path.join(siteDir, "assets");
    copyDirectory(assetsFolder, destAssetsFolder);
    console.log(`✅ Copied assets folder to ${destAssetsFolder}`);
  }
} catch (err) {
  console.error("❌ Failed to copy the assets folder:", err);
}

let tableNames = []; // Collect table names

// Check if 'parsedSchema.statement' is an array
if (Array.isArray(parsedSchema.statement)) {
  parsedSchema.statement.forEach((statement) => {
    if (statement.variant === "create" && statement.format === "table") {
      const tableName = statement.name.name;
      const fields = statement.definition;

      if (tableName && Array.isArray(fields)) {
        // Skip tables with 'as_internal' field
        const hasAsInternalField = fields.some(
          (field) => field.name === "as_internal"
        );

        if (hasAsInternalField) {
          console.log(`Skipping table: ${tableName}`);
          return;
        }

        tableNames.push(tableName);

        // Create subdirectory for the table
        const tableDir = path.join(siteDir, tableName);
        if (!fs.existsSync(tableDir)) {
          fs.mkdirSync(tableDir, { recursive: true });
        }

        // Generate pages
        fs.writeFileSync(
          path.join(tableDir, "index.html"),
          nunjucks.render("indexTable.njk", { tableName, fields })
        );

        fs.writeFileSync(
          path.join(tableDir, `view.html`),
          nunjucks.render("viewTable.njk", { tableName, fields })
        );

        fs.writeFileSync(
          path.join(tableDir, `add.html`),
          nunjucks.render("addTable.njk", { tableName, fields })
        );

        fs.writeFileSync(
          path.join(tableDir, `edit.html`),
          nunjucks.render("editTable.njk", { tableName, fields })
        );

        console.log(`Pages generated for table: ${tableName}`);
      }
    }
  });

  // Generate CRUD API Functions
  generateApiFunctions(tableNames);

  // Render the main index page
  fs.writeFileSync(
    path.join(siteDir, "index.html"),
    nunjucks.render("mainIndex.njk", { tables: tableNames })
  );

  console.log("✅ Main index page generated!");
} else {
  console.error("❌ Parsed schema is not in the expected format.");
}
