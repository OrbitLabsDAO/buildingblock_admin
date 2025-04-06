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
const copyDirectory = (src, dest) => {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    fs.lstatSync(srcPath).isDirectory()
      ? copyDirectory(srcPath, destPath)
      : fs.copyFileSync(srcPath, destPath);
  }
};

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

const renderTemplateWithLayout = (layoutName, context) => {
  for (const dir of ["_custom", "_corenjks"]) {
    const layoutPath = path.join(dir, layoutName);
    if (fs.existsSync(layoutPath)) {
      const template = fs.readFileSync(layoutPath, "utf-8");
      return nunjucks.renderString(template, context);
    }
  }
  throw new Error(`Layout template '${layoutName}' not found`);
};

// === GENERATORS ===
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

  allTables.forEach((tableName) => {
    try {
      const rendered = nunjucks.renderString(apiContent, { tableName, env });
      fs.writeFileSync(path.join(apiFolder, `${tableName}.js`), rendered);
      console.log(`✅ Created API endpoint for ${tableName}`);
    } catch (err) {
      console.error(`❌ Error rendering API for ${tableName}:`, err);
    }
  });
  console.log("✅ API files Processed!");
};

const generateTablePages = (tableName, fields, tableNames) => {
  const pageDir = path.join(siteDir, `tables/${tableName}`);
  fs.mkdirSync(pageDir, { recursive: true });

  ["Index", "View", "Add", "Edit"].forEach((type) => {
    const data = processFile(`table${type}.njk`, "_corenjks") || {};
    const filePath = path.join(pageDir, `${type.toLowerCase()}.html`);
    const inner = nunjucks.renderString(data.content, {
      tableName,
      fields,
      tableNames,
      env,
    });

    const content = data.layout
      ? renderTemplateWithLayout(data.layout, {
          tableName,
          fields,
          content: inner,
          tableNames,
          env,
        })
      : inner;

    fs.writeFileSync(filePath, content);
    console.log(`✅ Created page ${tableName}/${type}.html`);
  });
};

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

const processCustomFiles = () => {
  console.log("✅ Processing Custom files!");
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

      if (file.endsWith(".js")) {
        const dest = `functions/api/${tableName}.js`;
        fs.copyFileSync(fullPath, dest);
        console.log(`✅ Copied ${file} to ${dest}`);
        return;
      }

      const { layout, content } =
        processFile(file, path.join(customFolder, folder)) || {};
      const viewType = file
        .replace("table", "")
        .replace(".njk", "")
        .toLowerCase();
      const outputFile = path.join(outputPath, `${viewType}.html`);

      const inner = nunjucks.renderString(content, { env, tableNames });
      const final = layout
        ? renderTemplateWithLayout(layout, { content: inner, env, tableNames })
        : inner;

      fs.writeFileSync(outputFile, final);
      console.log(`✅ Created custom page: ${file}`);
    });
  });
  console.log("✅ Custom files processed!");
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

// === Step 1: Collect all valid table names (after exclusions) ===
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
console.log("✅ Processing Table files!");
if (Array.isArray(parsedSchema.statement)) {
  parsedSchema.statement.forEach((stmt) => {
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

      const sanitizedFields = fields.filter(
        (f) => !env.EXCLUDEDFIELDS.includes(f.name)
      );
      //tableNames.push(tableName);
      if (!env.EXCLUDETABLES.includes(tableName)) {
        generateTablePages(tableName, sanitizedFields, tableNames);
      }
    }
  });
  console.log("✅ Table files Processed!");

  // === ADDITIONAL PAGES ===
  processAccountFiles(tableNames);
  generateApiFunctions(tableNames);
  processCustomFiles();

  // === MAIN INDEX PAGE ===
  fs.writeFileSync(
    path.join(siteDir, "index.html"),
    nunjucks.render("indexMain.njk", { tableNames })
  );
  console.log("✅ Main index page generated!");
} else {
  console.error("❌ Parsed schema is not in the expected format.");
}
