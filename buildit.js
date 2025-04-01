const fs = require("fs");
const path = require("path");
const sqliteParser = require("sqlite-parser");
const nunjucks = require("nunjucks");
const matter = require("gray-matter");

// Set up Nunjucks environment
nunjucks.configure("_includes", { autoescape: true });
const args = process.argv.slice(2);

const environment = args.includes("prod") ? "production" : "local";

// Load env config
let getEnvConfig;
let env = {};
try {
  if (fs.existsSync("./_data/env.js")) {
    getEnvConfig = require("./_data/env.js");
    console.log("✅ env.js file loaded");
    env = getEnvConfig;
    console.log(env.APIURL);
  }
} catch (err) {
  console.error("❌ Error loading env.js:", err);
}

// Get SQL file
let sqlFilePath = "sql/schema.sql";
if (!fs.existsSync(sqlFilePath)) {
  console.error("❌ Invalid path. Please specify a valid SQL file.");
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");
const parsedSchema = sqliteParser(sqlContent);

// Define directories
const siteDir = path.join(__dirname, "_site");
const includesFolder = path.join(__dirname, "_includes");
const accountsFolder = path.join(__dirname, "_account");
const assetsFolder = path.join("./_source", "assets");
const functionsFolder = path.join("./_source", "functions");
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
  const tableDir = path.join(siteDir, `/tables/${tableName}`);
  if (!fs.existsSync(tableDir)) {
    fs.mkdirSync(tableDir, { recursive: true });
  }

  const pageTypes = ["index", "view", "add", "edit"];
  pageTypes.forEach((pageType) => {
    const pageData = processFile(`${pageType}Table.njk`, includesFolder) || {};
    const outputFile = path.join(tableDir, `${pageType}.html`);

    let renderedContent;

    if (pageData.layout) {
      try {
        renderedContent = nunjucks.render(
          path.join(includesFolder, pageData.layout),
          {
            tableName,
            fields,
            content: nunjucks.renderString(pageData.content, {
              tableName,
              fields,
            }),
            env, // ✅ Pass env object here
          }
        );
      } catch (err) {
        console.error(`❌ Error rendering layout ${pageData.layout}:`, err);
      }
    } else {
      renderedContent = nunjucks.renderString(pageData.content, {
        tableName,
        fields,
        env, // ✅ Pass env object here
      });
    }

    fs.writeFileSync(outputFile, renderedContent);
    console.log(`✅ Created page ${tableName}/${pageType}.html`);
  });
}

// Utility: Process .njk files in the '_account' folder
function processAccountFiles() {
  const accountFiles = fs
    .readdirSync(accountsFolder)
    .filter((file) => file.endsWith(".njk"));

  accountFiles.forEach((file) => {
    const pageData = processFile(file, accountsFolder) || {};

    if (pageData.content) {
      const tmpFile = file.replace(".njk", "");
      const outputDir = path.join(siteDir, tmpFile);
      const outputFile = path.join(outputDir, "index.html");

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      let renderedContent;
      const customEnv = new nunjucks.Environment(
        new nunjucks.FileSystemLoader(accountsFolder),
        { autoescape: true }
      );

      if (pageData.layout) {
        try {
          renderedContent = nunjucks.render(
            path.join(includesFolder, pageData.layout),
            {
              content: customEnv.renderString(pageData.content),
              env, // ✅ Pass env object here
            }
          );
        } catch (err) {
          console.error(`❌ Error rendering layout ${pageData.layout}:`, err);
        }
      } else {
        renderedContent = customEnv.renderString(pageData.content, { env });
      }

      fs.writeFileSync(outputFile, renderedContent);
      console.log(`✅ Created account page: ${file}`);
    }
  });
}

// Utility: Generate API Functions
function generateApiFunctions(tableNames) {
  const functionsDir = path.join(siteDir, "functions");

  // if (!fs.existsSync(functionsDir)) {
  //   fs.mkdirSync(functionsDir, { recursive: true });
  // }

  tableNames.forEach((tableName) => {
    const templateContent = nunjucks.render("api.njk", {
      tableName,
      env, // ✅ Pass env object here
    });
    //console.log(`functions/api/${tableName}.js`);
    fs.writeFileSync(`functions/api/tables/${tableName}.js`, templateContent);
  });

  console.log("✅ CRUD API functions generated!");
}

/*
END OF UTILITY FUNCTIONS
*/

// Delete the _site folder
if (fs.existsSync(siteDir)) {
  fs.rmSync(siteDir, { recursive: true, force: true });
}
fs.mkdirSync(siteDir, { recursive: true });

// Copy the assets
if (fs.existsSync(assetsFolder)) {
  copyDirectory(assetsFolder, path.join(siteDir, "assets"));
}

// Copy functions
if (fs.existsSync(functionsFolder)) {
  copyDirectory(functionsFolder, path.join(siteDir, "functions"));
}

let tableNames = [];

if (Array.isArray(parsedSchema.statement)) {
  parsedSchema.statement.forEach((statement) => {
    if (statement.variant === "create" && statement.format === "table") {
      const tableName = statement.name.name;
      const fields = statement.definition;

      if (!fields.some((field) => field.name === "as_internal")) {
        tableNames.push(tableName);
        generatePages(tableName, fields);
      }
    }
  });

  processAccountFiles();
  generateApiFunctions(tableNames);

  //create the tables index file
  fs.writeFileSync(
    path.join(siteDir, "tables/index.html"),
    nunjucks.render("indexTable.njk", { tables: tableNames })
  );
  console.log("✅ Tables index page generated!");

  //create the index file
  fs.writeFileSync(
    path.join(siteDir, "index.html"),
    nunjucks.render("indexMain.njk", {})
  );
  console.log("✅ Main index page generated!");
} else {
  console.error("❌ Parsed schema is not in the expected format.");
}
