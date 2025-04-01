const fs = require("fs");
const path = require("path");
const sqliteParser = require("sqlite-parser");
const nunjucks = require("nunjucks");
const matter = require("gray-matter");

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
const includesFolder = path.join(__dirname, "_includes");
const accountsFolder = path.join(__dirname, "_account"); // Adjusted path to root folder
const assetsFolder = path.join("./_source", "assets");
const customDir = path.join(__dirname, "_custom");

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

// Utility: Process file for front matter, layout, and permalink
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

// Utility: Generate pages with front matter
function generatePages(tableName, fields) {
  const tableDir = path.join(siteDir, tableName);
  if (!fs.existsSync(tableDir)) {
    fs.mkdirSync(tableDir, { recursive: true });
  }

  const pageTypes = ["index", "view", "add", "edit"];
  pageTypes.forEach((pageType) => {
    const pageData = processFile(`${pageType}Table.njk`, includesFolder) || {};

    const outputFile = path.join(tableDir, `${pageType}.html`);

    let renderedContent;

    // If there's a layout defined, render it
    if (pageData.layout) {
      try {
        // Render the content using the layout
        renderedContent = nunjucks.render(
          path.join(includesFolder, pageData.layout),
          {
            tableName,
            fields,
            content: nunjucks.renderString(pageData.content, {
              tableName,
              fields,
            }),
          }
        );
      } catch (err) {
        console.error(`❌ Error rendering layout ${pageData.layout}:`, err);
      }
    } else {
      // If no layout, just render content directly
      renderedContent = nunjucks.renderString(pageData.content, {
        tableName,
        fields,
      });
    }

    // Write the rendered content to the output file
    fs.writeFileSync(outputFile, renderedContent);
    console.log(`✅ Created page ${tableName}/${pageType}.html`);
  });
}

// Utility: Process .njk files in the '_includes/accounts' folder
function processAccountFiles() {
  // Read all .njk files from the accounts folder
  const accountFiles = fs
    .readdirSync(accountsFolder)
    .filter((file) => file.endsWith(".njk"));

  accountFiles.forEach((file) => {
    const pageData = processFile(file, accountsFolder) || {};

    // Ensure content is present before attempting to render
    if (pageData.content) {
      // Construct output path
      const tmpFile = file.replace(".njk", "");
      const outputDir = path.join(siteDir, tmpFile); // Directory path
      const outputFile = path.join(outputDir, "index.html"); // Output file path

      // Ensure the directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      let renderedContent;
      // Set up Nunjucks environment
      const customEnv = new nunjucks.Environment(
        new nunjucks.FileSystemLoader(accountsFolder),
        { autoescape: true }
      );
      // If there's a layout defined, render the content using the layout
      //console.log(file);
      //console.log(pageData.layout);
      if (pageData.layout) {
        try {
          // this is not including the custom layout file and spazzing
          renderedContent = nunjucks.render(
            path.join(includesFolder, pageData.layout),
            {
              content: customEnv.renderString(pageData.content),
            }
          );
        } catch (err) {
          console.error(`❌ Error rendering layout ${pageData.layout}:`, err);
        }
      } else {
        renderedContent = customEnv.renderString(pageData.content);
      }

      // Write the rendered content to the output HTML file
      fs.writeFileSync(outputFile, renderedContent);
      console.log(`✅ Created account page: ${file}`);
    }
  });
}

// Utility: Generate API Functions
function generateApiFunctions(tableNames) {
  const functionsDir = path.join(siteDir, "functions");

  if (!Array.isArray(tableNames)) {
    console.error("tableNames should be an array");
    return;
  }

  if (!fs.existsSync(functionsDir)) {
    fs.mkdirSync(functionsDir, { recursive: true });
  }

  tableNames.forEach((tableName) => {
    const customTemplatePath = path.join(customDir, `${tableName}_api.njk`);
    let templateContent;

    if (fs.existsSync(customTemplatePath)) {
      console.log(`✅ Using custom template for API ${tableName}`);

      // Custom environment for templates
      const customEnv = new nunjucks.Environment(
        new nunjucks.FileSystemLoader("_custom"),
        { autoescape: true }
      );

      templateContent = customEnv.render(`${tableName}_api.njk`, { tableName });
    } else {
      // Using default template
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
        generatePages(tableName, fields);
      }
    }
  });

  // Process .njk files from the _includes/accounts folder (after SQL processing)
  processAccountFiles();

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
